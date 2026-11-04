using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Playwright;
using Xunit;

public class UnitTests
{
    [Theory]
    [InlineData("../private.md")]
    [InlineData("nested/../../private.md")]
    [InlineData("/etc/passwd")]
    public void AssetPathsCannotEscapeThePublicationRoot(string path) => Assert.Throws<ArgumentException>(() => BuildFiles.ResolveInside("/tmp/site", path));

    [Fact]
    public void RelativeAssetPathsRetainTheirLocation() => Assert.Equal("/tmp/site/downloads/resume.pdf", BuildFiles.ResolveInside("/tmp/site", "downloads/resume.pdf"));
}

public class IntegrationTests
{
    private static string Root => Environment.GetEnvironmentVariable("PORTFOLIO_ROOT") ?? Directory.GetCurrentDirectory();
    [Fact]
    public void GeneratedSiteHasTheCanonicalResumeAndIndependentDownloads()
    {
        BuildFiles.VerifyOutput(Path.Combine(Root, "public"));
        var text = File.ReadAllText(Path.Combine(Root, "public/resume/index.html"));
        foreach (var employer in new[] { "Reprise Financial", "Beretta Holdings", "Microsoft", "Stock Technologies", "Beacon Hill Staffing", "Austin College" }) Assert.Contains(employer, text);
    }
    [Fact]
    public void EveryCuratedProjectAndArticleHasOutput()
    {
        foreach (var name in new[] { "projects", "articles" })
        {
            using var data = JsonDocument.Parse(File.ReadAllText(Path.Combine(Root, $"data/{name}.json")));
            Assert.NotEmpty(data.RootElement.EnumerateArray());
            foreach (var item in data.RootElement.EnumerateArray()) Assert.True(File.Exists(BuildFiles.ResolveInside(Path.Combine(Root, "public"), item.GetProperty("url").GetString()!.TrimStart('/'))));
        }
    }
    [Fact]
    public void DocumentationIndexesEveryExistingPublicArticleAsAReadableGuide()
    {
        var output = Path.Combine(Root, "public");
        using var index = JsonDocument.Parse(File.ReadAllText(Path.Combine(output, "docs/index.json")));
        var guides = index.RootElement.EnumerateArray().ToArray();
        Assert.NotEmpty(guides);
        Assert.Contains(guides, x => x.GetProperty("url").GetString() == "/docs/engineering-delivery-architecture/" && x.GetProperty("text").GetString()!.Contains("18. Observed baseline and limitations"));
        var urls = guides.Select(x => x.GetProperty("url").GetString()!).ToArray();
        Assert.Equal(urls.Length, urls.Distinct(StringComparer.Ordinal).Count());
        using var articles = JsonDocument.Parse(File.ReadAllText(Path.Combine(Root, "data/articles.json")));
        foreach (var article in articles.RootElement.EnumerateArray())
            Assert.Contains("/docs/" + Path.GetFileNameWithoutExtension(article.GetProperty("url").GetString()) + "/", urls);
        foreach (var guide in guides)
        {
            var url = guide.GetProperty("url").GetString()!;
            Assert.StartsWith("/docs/", url);
            Assert.True(File.Exists(BuildFiles.ResolveInside(output, url.TrimStart('/') + "index.html")));
            Assert.True(guide.GetProperty("text").GetString()!.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries).Length > 50,
                "Every indexed guide must contain its substantive public article text.");
        }
    }
    [Fact]
    public void PublishedAssetsMatchTheirChecksums()
    {
        using var data = JsonDocument.Parse(File.ReadAllText(Path.Combine(Root, "public/release-files.json")));
        foreach (var file in data.RootElement.EnumerateArray())
        {
            var path = BuildFiles.ResolveInside(Path.Combine(Root, "public"), file.GetProperty("path").GetString()!);
            Assert.Equal(file.GetProperty("sha256").GetString(), Convert.ToHexStringLower(System.Security.Cryptography.SHA256.HashData(File.ReadAllBytes(path))));
        }
    }
}

public class BrowserTests
{
    [Fact]
    public async Task ResumeNavigationWorksOnMobileWithoutHorizontalOverflow()
    {
        var target = Environment.GetEnvironmentVariable("PORTFOLIO_TEST_URL") ?? throw new InvalidOperationException("PORTFOLIO_TEST_URL is required");
        using var playwright = await Playwright.CreateAsync();
        await using var browser = await playwright.Chromium.LaunchAsync(new() { Headless = true });
        var page = await browser.NewPageAsync(new() { ViewportSize = new() { Width = 390, Height = 844 } });
        await page.GotoAsync(target);
        await page.GetByRole(AriaRole.Navigation).GetByRole(AriaRole.Link, new() { Name = "Resume", Exact = true }).ClickAsync();
        await Assertions.Expect(page.GetByRole(AriaRole.Button, new() { Name = "Print resume" })).ToBeVisibleAsync();
        Assert.True(await page.EvaluateAsync<bool>("document.documentElement.scrollWidth <= window.innerWidth"));
        await page.ScreenshotAsync(new() { Path = Path.Combine(Environment.GetEnvironmentVariable("PORTFOLIO_EVIDENCE") ?? Path.GetTempPath(), "resume-mobile.png"), FullPage = true });
    }
    [Fact]
    public async Task DocumentationSearchTreatsReaderQueriesAsText()
    {
        var target = Environment.GetEnvironmentVariable("PORTFOLIO_TEST_URL") ?? throw new InvalidOperationException("PORTFOLIO_TEST_URL is required");
        using var playwright = await Playwright.CreateAsync();
        await using var browser = await playwright.Chromium.LaunchAsync(new() { Headless = true });
        var page = await browser.NewPageAsync();
        Assert.Equal(200, (await page.GotoAsync(new Uri(new Uri(target), "/docs/").AbsoluteUri))?.Status);
        await page.GetByRole(AriaRole.Searchbox, new() { Name = "Search documentation", Exact = true })
            .FillAsync("<img src=x onerror=window.docsSearchProbe=1>");
        await Assertions.Expect(page.GetByRole(AriaRole.Region, new() { Name = "Documentation search results", Exact = true }))
            .ToContainTextAsync("No documents found");
        Assert.Equal(0, await page.Locator("#docs-search-results img").CountAsync());
        Assert.True(await page.EvaluateAsync<bool>("typeof window.docsSearchProbe === 'undefined'"));
    }
    [Fact]
    public async Task AllRetainedDemosLoadTheirApplicationWithoutMissingLocalAssets()
    {
        var target = Environment.GetEnvironmentVariable("PORTFOLIO_TEST_URL") ?? throw new InvalidOperationException("PORTFOLIO_TEST_URL is required");
        var root = Environment.GetEnvironmentVariable("PORTFOLIO_ROOT") ?? Directory.GetCurrentDirectory();
        using var data = JsonDocument.Parse(File.ReadAllText(Path.Combine(root, "data/projects.json")));
        using var playwright = await Playwright.CreateAsync();
        await using var browser = await playwright.Chromium.LaunchAsync(new() { Headless = true });
        foreach (var project in data.RootElement.EnumerateArray())
        {
            var page = await browser.NewPageAsync();
            var missing = new List<string>();
            page.Response += (_, response) => { if (response.Status >= 400 && new Uri(response.Url).Authority == new Uri(target).Authority) missing.Add(response.Url); };
            var response = await page.GotoAsync(new Uri(new Uri(target), project.GetProperty("url").GetString()!).AbsoluteUri);
            Assert.Equal(200, response?.Status);
            await Assertions.Expect(page.Locator("#app")).Not.ToBeEmptyAsync(new() { Timeout = 15000 });
            await page.WaitForTimeoutAsync(300);
            Assert.Empty(missing);
            await page.CloseAsync();
        }
    }

}
