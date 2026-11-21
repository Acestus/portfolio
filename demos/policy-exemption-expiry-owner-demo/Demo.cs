using System.Text.Json;

if (args.Length != 1)
{
    Console.Error.WriteLine("Choose a step from the README.");
    return 2;
}

switch (args[0])
{
    case "record-scope-and-ownership":
    {
        Show(new { scope = "demo/vm-b", owner = "data ops", reason = "vendor upgrade", control = "daily scan", expires = "2026-12-01" });
        break;
    }
    case "check-expiry":
    {
        var expiry = new DateOnly(2026, 12, 1);
        Show(new[] { new DateOnly(2026, 11, 28), expiry }.Select(day => new { day, valid = day < expiry }));
        break;
    }
    case "decide-whether-to-renew":
    {
        var resolved = true;
        var approved = false;
        Console.WriteLine(resolved ? "Decision: close" : approved ? "Decision: renew" : "Decision: review");
        break;
    }
    default:
        Console.Error.WriteLine($"Unknown demo step: {args[0]}");
        return 2;
}
return 0;

static void Show<T>(T value) => Console.WriteLine(JsonSerializer.Serialize(value, new JsonSerializerOptions { WriteIndented = true }));
