using System.Text.Json;

if (args.Length != 1)
{
    Console.Error.WriteLine("Choose a step from the README.");
    return 2;
}

switch (args[0])
{
    case "show-the-role-boundary":
    {
        Show(new Dictionary<string, bool> { ["demo-app"] = true, ["anonymous"] = false });
        break;
    }
    case "verify-allowed-read":
    {
        var vault = new Dictionary<string, string> { ["demo-secret"] = "dummy-value" };
        string? Get(string principal) => principal == "demo-app" ? vault["demo-secret"] : null;
        Check(Get("demo-app") == "dummy-value", "Expected dummy value returned");
        break;
    }
    case "verify-denied-read":
    {
        var vault = new Dictionary<string, string> { ["demo-secret"] = "dummy-value" };
        string? Get(string principal) => principal == "demo-app" ? vault["demo-secret"] : null;
        Check(Get("anonymous") is null, "Unauthorized identity received no value");
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
