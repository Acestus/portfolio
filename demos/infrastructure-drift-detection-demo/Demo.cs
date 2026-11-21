using System.Text.Json;

if (args.Length != 1)
{
    Console.Error.WriteLine("Choose a step from the README.");
    return 2;
}

switch (args[0])
{
    case "display-desired-state":
    {
        Show(new { owner = "demo-team", stage = "dev" });
        break;
    }
    case "detect-the-drift":
    {
        var declared = "demo-team";
        var observed = "manual-edit";
        Check(!string.Equals(declared, observed), $"Drift on owner: {declared} → {observed}");
        break;
    }
    case "reconcile-tracked-properties":
    {
        var declared = new { owner = "demo-team" };
        var observed = new { owner = "demo-team", runtimeRows = 5 };
        Check(declared.owner == observed.owner, "Tracked owner matches. Runtime rows are outside the comparison.");
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
