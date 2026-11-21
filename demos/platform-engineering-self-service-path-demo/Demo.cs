using System.Text.Json;

if (args.Length != 1)
{
    Console.Error.WriteLine("Choose a step from the README.");
    return 2;
}

switch (args[0])
{
    case "submit-the-request":
    {
        Show(new { service = "orders", size = "small" });
        break;
    }
    case "show-a-useful-validation-error":
    {
        var allowed = new[] { "small", "medium" };
        Check(!allowed.Contains("giant"), "Rejected giant. Choose small or medium.");
        break;
    }
    case "generate-the-plan":
    {
        const string size = "small";
        Check(new[] { "small", "medium" }.Contains(size), "Request passes validation");
        Show(new { service = "orders", size, logging = true, environment = "development", review = "platform team" });
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
