using System.Text.Json;

if (args.Length != 1)
{
    Console.Error.WriteLine("Choose a step from the README.");
    return 2;
}

switch (args[0])
{
    case "read-the-signal":
    {
        var samples = new[] { 3, 4, 20, 5 };
        Show(new { meanCpu = samples.Average(), peakCpu = samples.Max() });
        Check(samples.Average() == 8, "Review the peak as well as the mean");
        break;
    }
    case "look-for-dependencies":
    {
        var dependencies = new[] { "nightly backup" };
        Show(new { owner = "data ops", dependencies });
        Check(dependencies.Length > 0, "Investigate with the resource owner");
        break;
    }
    case "compare-against-a-baseline":
    {
        var before = new[] { 30, 30, 30 }.Sum();
        var after = new[] { 24, 24, 24 }.Sum();
        Show(new { before, after, difference = before - after });
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
