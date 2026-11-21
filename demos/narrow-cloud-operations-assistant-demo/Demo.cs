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
    case "allow-a-known-service":
    {
        var services = new Dictionary<string, string> { ["orders"] = "healthy" };
        Check(services.GetValueOrDefault("orders") == "healthy", "orders: healthy");
        break;
    }
    case "reject-an-unknown-service":
    {
        var services = new Dictionary<string, string> { ["orders"] = "healthy" };
        Check(!services.ContainsKey("billing"), "billing: rejected by the allowlist");
        break;
    }
    case "record-the-outcome":
    {
        var services = new Dictionary<string, string> { ["orders"] = "healthy" };
        const string service = "orders";
        Show(new { tool = "get_status", service, accepted = services.ContainsKey(service), result = services.GetValueOrDefault(service) });
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
