#:property PublishAot=false
#:package Microsoft.Playwright@1.64.1
using Microsoft.Playwright;

if (args.SequenceEqual(["install"]))
    return Microsoft.Playwright.Program.Main(["install", "chromium"]);
if (args.Length != 0)
    return 2;

using var playwright = await Playwright.CreateAsync();
await using var browser = await playwright.Chromium.LaunchAsync();
var page = await browser.NewPageAsync();
await page.GotoAsync(new Uri(Path.GetFullPath("search.html")).AbsoluteUri);
await page.GetByRole(AriaRole.Searchbox, new() { Name = "Search guides" }).FillAsync("Fabric");
await Assertions.Expect(page.GetByRole(AriaRole.Status)).ToBeVisibleAsync();
await Assertions.Expect(page.GetByRole(AriaRole.Status)).ToHaveTextAsync("Fabric CI/CD");
Console.WriteLine("PASS: searching for Fabric shows the Fabric CI/CD result");
return 0;
