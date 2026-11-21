using System.Text.Json;

if (args.Length != 1)
{
    Console.Error.WriteLine("Choose a step from the README.");
    return 2;
}

switch (args[0])
{
    case "land-bronze-rows":
    {
        var rows = File.ReadAllLines("orders.csv").Skip(1).Select(raw => new { raw, ingestedUtc = "2026-11-21T06:00Z" }).ToArray();
        Show(rows);
        Check(rows.Length == 3, "Bronze retained the three source rows");
        break;
    }
    case "validate-silver-rows":
    {
        var rows = File.ReadAllLines("orders.csv").Skip(1).Select(line => line.Split(',')).ToArray();
        var valid = rows.Where(row => int.TryParse(row[1], out _)).Select(row => int.Parse(row[1])).ToArray();
        var rejected = rows.Where(row => !int.TryParse(row[1], out _)).Select(row => row[0]).ToArray();
        Show(new { valid, rejected });
        Check(valid.SequenceEqual([12, 8]) && rejected.SequenceEqual(["b"]), "Silver validated two rows and quarantined b");
        break;
    }
    case "reconcile-gold-totals":
    {
        var amounts = File.ReadAllLines("orders.csv").Skip(1).Select(line => line.Split(',')[1]).Where(amount => int.TryParse(amount, out _)).Select(int.Parse).ToArray();
        Show(new { orders = amounts.Length, total = amounts.Sum() });
        Check(amounts.Length == 2 && amounts.Sum() == 20, "Gold totals reconcile");
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
