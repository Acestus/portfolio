using System.Text.Json;

if (args.Length != 1)
{
    Console.Error.WriteLine("Choose a step from the README.");
    return 2;
}

switch (args[0])
{
    case "capture-the-source-settings":
    {
        Show(new { schedule = "06:00 UTC", connection = "demo-dev", region = "test" });
        break;
    }
    case "compare-the-destination":
    {
        var source = new Dictionary<string, string> { ["schedule"] = "06:00 UTC", ["connection"] = "demo-dev", ["region"] = "test" };
        var target = new Dictionary<string, string> { ["connection"] = "demo-stg", ["region"] = "test" };
        Show(source.Where(pair => target.GetValueOrDefault(pair.Key) != pair.Value).Select(pair => new { setting = pair.Key, before = pair.Value, after = target.GetValueOrDefault(pair.Key) }));
        Check(!target.ContainsKey("schedule"), "Destination is missing its schedule");
        break;
    }
    case "gate-on-required-settings":
    {
        var required = new[] { "schedule", "connection", "region" };
        Show(new { before = required.Except(["connection", "region"]), after = required.Except(["schedule", "connection", "region"]) });
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
