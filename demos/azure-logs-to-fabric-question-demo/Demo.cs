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
    case "generate-sample-events":
    {
        Console.WriteLine(File.ReadAllText("events.csv"));
        break;
    }
    case "query-failed-runs":
    {
        var failures = File.ReadAllLines("events.csv").Skip(1).Select(row => row.Split(',')).Where(row => row[1] == "failed").GroupBy(row => row[0]).ToDictionary(group => group.Key, group => group.Count());
        Show(failures);
        Check(failures.Count == 1 && failures.GetValueOrDefault("orders") == 2, "Two orders failures");
        break;
    }
    case "measure-freshness":
    {
        var eventTime = new TimeOnly(6, 5);
        var refreshTime = new TimeOnly(6, 20);
        Console.WriteLine($"Observed lag: {(refreshTime - eventTime).TotalMinutes} minutes");
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
