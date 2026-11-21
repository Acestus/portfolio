#:property PublishAot=false
#:property JsonSerializerIsReflectionEnabledByDefault=true
using System.Text.Json;

if (args.Length != 1)
{
    Console.Error.WriteLine("Choose a step from the README.");
    return 2;
}

switch (args[0])
{
    case "show-the-scheduled-input":
    {
        Show(new { timeUtc = "06:00", pipeline = "daily-orders", input = "sample-orders.csv" });
        break;
    }
    case "explain-token-expiry":
    {
        const int expires = 300;
        Show(new[] { 120, 301 }.Select(elapsed => new { elapsed, valid = elapsed < expires }));
        break;
    }
    case "follow-the-run-receipt":
    {
        var trigger = new { http = 202, runId = "demo-17" };
        var outcomes = new Dictionary<string, string> { ["demo-17"] = "Succeeded" };
        Check(trigger.http == 202 && outcomes[trigger.runId] == "Succeeded", trigger.runId + " reached " + outcomes[trigger.runId]);
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
