using System.Text.Json;

if (args.Length != 1)
{
    Console.Error.WriteLine("Choose a step from the README.");
    return 2;
}

switch (args[0])
{
    case "find-the-missing-tag":
    {
        var tags = new Dictionary<string, string> { ["stage"] = "demo" };
        Check(!tags.ContainsKey("owner"), "Missing tag: owner");
        break;
    }
    case "preview-remediation":
    {
        var before = new Dictionary<string, string> { ["stage"] = "demo" };
        var after = new Dictionary<string, string>(before) { ["owner"] = "demo-team" };
        Show(new { before, after });
        break;
    }
    case "recheck-compliance":
    {
        var tags = new Dictionary<string, string> { ["owner"] = "unknown" };
        Show(new { present = tags.ContainsKey("owner"), matchesInventory = tags["owner"] == "demo-team" });
        break;
    }
    default:
        Console.Error.WriteLine($"Unknown demo step: {args[0]}");
        return 2;
}
return 0;

static void Show<T>(T value) => Console.WriteLine(JsonSerializer.Serialize(value, new JsonSerializerOptions { WriteIndented = true }));

static void Check(bool passed, string message)
{
    Console.WriteLine($"{(passed ? "PASS" : "FAIL")}: {message}");
    if (!passed) Environment.Exit(1);
}
