using System.Diagnostics;

string source = Path.GetFullPath("demos");
if (!Directory.Exists(source) || args.Length is < 1 or > 2)
{
    Console.Error.WriteLine("From the portfolio root: dotnet run --file scripts/SeedDemo.cs -- <demo-name|all> [destination]");
    return 2;
}

var names = Directory.GetDirectories(source).Select(Path.GetFileName).OfType<string>().Order().ToArray();
if (args[0] != "all" && !names.Contains(args[0], StringComparer.Ordinal))
{
    Console.Error.WriteLine($"Unknown demo: {args[0]}");
    return 2;
}
var selected = args[0] == "all" ? names.Where(name => name != "hotfix-demo").ToArray() : [args[0]];
var destination = Path.GetFullPath(args.Length == 2 ? args[1] : "/tmp/acestus-video-demos");
foreach (var name in selected)
{
    var target = Path.Combine(destination, name);
    if (Path.Exists(target))
    {
        Console.Error.WriteLine($"Already exists: {target}");
        return 1;
    }
}

Directory.CreateDirectory(destination);
foreach (var name in selected)
{
    string target = Path.Combine(destination, name);
    string scratch = Path.Combine(destination, $".seed-{Guid.NewGuid():N}");
    try
    {
        CopyFixture(Path.Combine(source, name), scratch);
        Git(scratch, "init", "--quiet", "-b", "main");
        Git(scratch, "config", "user.name", "Acestus Demo");
        Git(scratch, "config", "user.email", "demo@example.invalid");
        Git(scratch, "config", "commit.gpgsign", "false");
        Git(scratch, "add", ".");
        Git(scratch, "commit", "--quiet", "-m", name == "hotfix-demo" ? "Create Hello World baseline and acceptance checks" : "Seed the demo");
        if (name == "hotfix-demo")
            SeedHotfixHistory(scratch);
        Directory.Move(scratch, target);
        Console.WriteLine(target);
    }
    finally
    {
        if (Directory.Exists(scratch))
            Directory.Delete(scratch, recursive: true);
    }
}
return 0;

static void SeedHotfixHistory(string root)
{
    foreach (var tag in new[] { "release-0", "stg", "prd" })
        Git(root, "tag", tag);

    Git(root, "switch", "--quiet", "--detach", "release-0");
    string hello = Path.Combine(root, "Hello.cs");
    string baseline = File.ReadAllText(hello);
    File.WriteAllText(hello, baseline.Replace("Hello World", "Hello World hotfix 1").Replace("BaseCount = 6", "BaseCount = 7"));
    Git(root, "commit", "--quiet", "-am", "Prepare the first hotfix from the production baseline");
    Git(root, "tag", "release-1-ready");
    Git(root, "switch", "--quiet", "main");
    foreach (var number in new[] { 3, 4 })
    {
        string file = $"Feature{number}.cs";
        File.WriteAllText(Path.Combine(root, file), $"public static class Feature{number} {{ }}\n");
        Git(root, "add", file);
        Git(root, "commit", "--quiet", "-m", $"Add feature {number}");
        Git(root, "tag", $"feature-{number}");
    }
}

static void CopyFixture(string source, string destination)
{
    Directory.CreateDirectory(destination);
    foreach (var file in Directory.EnumerateFiles(source))
        File.Copy(file, Path.Combine(destination, Path.GetFileName(file)));
    foreach (var folder in Directory.EnumerateDirectories(source))
        CopyFixture(folder, Path.Combine(destination, Path.GetFileName(folder)));
}

static void Git(string directory, params string[] arguments)
{
    var start = new ProcessStartInfo("git") { WorkingDirectory = directory, UseShellExecute = false };
    foreach (var argument in arguments)
        start.ArgumentList.Add(argument);
    using var process = Process.Start(start) ?? throw new InvalidOperationException("Could not start Git.");
    process.WaitForExit();
    if (process.ExitCode != 0)
        throw new InvalidOperationException($"Git {arguments[0]} failed in {directory}.");
}
