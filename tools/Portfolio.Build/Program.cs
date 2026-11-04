using System.Diagnostics;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.FileProviders;
using Microsoft.Playwright;

var candidate = new DirectoryInfo(Directory.GetCurrentDirectory());
while (candidate is not null && !File.Exists(Path.Combine(candidate.FullName, "hugo.toml"))) candidate = candidate.Parent;
var root = candidate?.FullName ?? throw new InvalidOperationException("Run within the portfolio repository.");
Directory.SetCurrentDirectory(root);
switch (args.FirstOrDefault())
{
    case "build":
        if (!args.Contains("--skip-legacy")) await ProcessRunner.RunAsync("npm", ["run", "release"]);
        BuildFiles.StageLegacyScripts(root);
        var hugo = Environment.GetEnvironmentVariable("HUGO_BINARY") ?? "hugo";
        var version = await ProcessRunner.ReadAsync(hugo, ["version"]);
        if (!version.Contains("v0.164.0")) throw new InvalidOperationException("Hugo 0.164.0 is required.");
        await ProcessRunner.RunAsync(hugo, ["--minify", "--cleanDestinationDir"]);
        await PdfRenderer.RenderAsync(root);
        BuildFiles.VerifyOutput(Path.Combine(root, "public"));
        await BuildFiles.WriteManifestAsync(root);
        break;
    case "verify": BuildFiles.VerifyOutput(Path.Combine(root, "public")); break;
    case "serve":
        var server = SiteServer.Create(Path.Combine(root, "public"), args.Length > 1 ? int.Parse(args[1]) : 1315);
        await server.RunAsync();
        break;
    default: Console.WriteLine("Portfolio.Build build [--skip-legacy] | verify | serve [port]"); return 2;
}
return 0;

public static class ProcessRunner
{
    public static async Task<string> ReadAsync(string executable, string[] arguments)
    {
        var info = new ProcessStartInfo(executable) { RedirectStandardOutput = true, RedirectStandardError = true };
        foreach (var argument in arguments) info.ArgumentList.Add(argument);
        using var process = Process.Start(info) ?? throw new InvalidOperationException($"Cannot start {executable}");
        var outputTask = process.StandardOutput.ReadToEndAsync();
        var errorTask = process.StandardError.ReadToEndAsync();
        using var timeout = new CancellationTokenSource(TimeSpan.FromMinutes(20));
        try { await process.WaitForExitAsync(timeout.Token); }
        catch { if (!process.HasExited) process.Kill(true); throw; }
        var output = await outputTask; var error = await errorTask;
        if (process.ExitCode != 0) throw new InvalidOperationException($"{executable} failed ({process.ExitCode}): {error}\n{output}");
        if (!string.IsNullOrWhiteSpace(error)) Console.Error.WriteLine(error);
        return output;
    }
    public static async Task RunAsync(string executable, string[] arguments) => Console.WriteLine(await ReadAsync(executable, arguments));
}

public static class BuildFiles
{
    public static string ResolveInside(string directory, string relative)
    {
        if (Path.IsPathRooted(relative) || relative.Split('/', '\\').Contains("..")) throw new ArgumentException("Relative asset path cannot escape its root.");
        var root = Path.GetFullPath(directory).TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;
        var result = Path.GetFullPath(Path.Combine(root, relative));
        if (!result.StartsWith(root, StringComparison.Ordinal)) throw new ArgumentException("Asset path is outside its root.");
        return result;
    }
    public static void StageLegacyScripts(string root)
    {
        var names = Regex.Matches(File.ReadAllText(Path.Combine(root, "shadow-cljs.edn")), ":output-dir \\\"resources/public/js/([^\\\"]+)\\\"")
            .Select(match => match.Groups[1].Value).ToArray();
        if (names.Length != 19 || names.Distinct().Count() != 19) throw new InvalidOperationException("Expected the reviewed inventory of 19 ClojureScript builds.");
        var destination = Path.Combine(root, ".build/legacy-js");
        if (Directory.Exists(destination)) Directory.Delete(destination, true);
        foreach (var name in names)
        {
            var source = ResolveInside(Path.Combine(root, "resources/public/js"), name + "/main.js");
            if (!File.Exists(source) || new FileInfo(source).Length < 100) throw new InvalidOperationException($"Missing compiled legacy build: {name}");
            var target = ResolveInside(destination, name + "/main.js");
            Directory.CreateDirectory(Path.GetDirectoryName(target)!); File.Copy(source, target);
        }
    }
    public static void VerifyOutput(string directory)
    {
        foreach (var relative in new[] { "index.html", "resume/index.html", "portfolio/index.html", "articles/index.html", "404.html", "site.css", "site.js", "downloads/william-weeks-balconi-resume.pdf", "articles/architecture-studio.html", "scouting/index.html", "scouting/assets/app.js", "scouting/assets/styles.css", "docs/index.html", "docs/index.json", "docs/architecture-studio/index.html", "docs/engineering-delivery-architecture/index.html", "docs.css", "docs.js" })
            if (!File.Exists(ResolveInside(directory, relative))) throw new InvalidOperationException($"Missing output: {relative}");
        var scouting = File.ReadAllText(ResolveInside(directory, "scouting/assets/app.js"));
        if (new[] { "BAND_ICAL_URL", "calendarSeed", "calendarEvents" }.Any(scouting.Contains)
            || Directory.Exists(ResolveInside(directory, "household")))
            throw new InvalidOperationException("Reader-only calendar or household data must not enter the public professional artifact.");
        using var routeConfig = JsonDocument.Parse(File.ReadAllText(ResolveInside(directory, "staticwebapp.config.json")));
        var routes = routeConfig.RootElement.GetProperty("routes").EnumerateArray().Select(item => item.GetProperty("route").GetString()!.TrimEnd('/')).ToArray();
        if (routes.Distinct(StringComparer.OrdinalIgnoreCase).Count() != routes.Length) throw new InvalidOperationException("Azure rejects duplicate routes after trailing-slash and case normalization.");
        var bytes = File.ReadAllBytes(ResolveInside(directory, "downloads/william-weeks-balconi-resume.pdf"));
        if (bytes.Length < 1000 || System.Text.Encoding.ASCII.GetString(bytes, 0, 5) != "%PDF-") throw new InvalidOperationException("Resume PDF is not valid output.");
        var resume = File.ReadAllText(ResolveInside(directory, "resume/index.html"));
        if (resume.Contains("resumeazure.blob.core.windows.net") || resume.Contains("yahooapis")) throw new InvalidOperationException("Legacy resume dependency leaked into output.");
        if (Directory.EnumerateFiles(directory, "*.map", SearchOption.AllDirectories).Any() || Directory.Exists(Path.Combine(directory, "js/hub/cljs-runtime"))) throw new InvalidOperationException("Development-only assets must not be published.");
        Console.WriteLine("Verified generated pages, resume PDF and absence of legacy resume dependencies/development assets.");
    }
    public static async Task WriteManifestAsync(string root)
    {
        var source = (await ProcessRunner.ReadAsync("git", ["rev-parse", "HEAD"])).Trim();
        var dirty = !string.IsNullOrWhiteSpace(await ProcessRunner.ReadAsync("git", ["status", "--porcelain"]));
        var output = Path.Combine(root, "public");
        var release = new { sourceCommit = source, dirty, acceptanceRepository = "Acestus/site-acceptance", acceptanceRevision = "f8c5647f2768bca58c0c1d86fd7216ed2a384415", hugo = "0.164.0", producerRun = Environment.GetEnvironmentVariable("GITHUB_RUN_ID"), producerAttempt = Environment.GetEnvironmentVariable("GITHUB_RUN_ATTEMPT") };
        File.WriteAllText(Path.Combine(output, "release.json"), JsonSerializer.Serialize(release));
        var files = Directory.EnumerateFiles(output, "*", SearchOption.AllDirectories).Where(file => Path.GetFileName(file) != "release-files.json")
            .OrderBy(file => file, StringComparer.Ordinal).Select(file => new { path = Path.GetRelativePath(output, file).Replace('\\', '/'), sha256 = Convert.ToHexStringLower(SHA256.HashData(File.ReadAllBytes(file))), bytes = new FileInfo(file).Length }).ToArray();
        File.WriteAllText(Path.Combine(output, "release-files.json"), JsonSerializer.Serialize(files));
        Console.WriteLine($"Manifest: {files.Length} files; source {source}; dirty={dirty}");
    }
}

public static class SiteServer
{
    public static WebApplication Create(string directory, int port)
    {
        var builder = WebApplication.CreateSlimBuilder();
        builder.WebHost.UseUrls($"http://127.0.0.1:{port}");
        builder.Logging.ClearProviders();
        var app = builder.Build();
        var provider = new PhysicalFileProvider(Path.GetFullPath(directory));
        app.UseDefaultFiles(new DefaultFilesOptions { FileProvider = provider });
        app.UseStaticFiles(new StaticFileOptions { FileProvider = provider });
        app.Run(async context => { context.Response.StatusCode = 404; context.Response.ContentType = "text/html"; await context.Response.SendFileAsync(Path.Combine(directory, "404.html")); });
        return app;
    }
}

public static class PdfRenderer
{
    public static async Task RenderAsync(string root)
    {
        await using var server = SiteServer.Create(Path.Combine(root, "public"), 1316);
        await server.StartAsync();
        try
        {
            using var playwright = await Playwright.CreateAsync();
            await using var browser = await playwright.Chromium.LaunchAsync(new() { Headless = true });
            var page = await browser.NewPageAsync();
            var response = await page.GotoAsync("http://127.0.0.1:1316/resume/");
            if (response?.Status != 200) throw new InvalidOperationException("Resume page did not render for PDF generation.");
            await page.EmulateMediaAsync(new() { Media = Media.Print });
            var destination = Path.Combine(root, "public/downloads/william-weeks-balconi-resume.pdf");
            Directory.CreateDirectory(Path.GetDirectoryName(destination)!);
            await page.PdfAsync(new() { Path = destination, Format = "A4", PrintBackground = true, PreferCSSPageSize = true });
            Console.WriteLine("Rendered resume PDF from generated resume HTML.");
        }
        finally { await server.StopAsync(); }
    }
}
