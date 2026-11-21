using System.Text.Json;

if (args.Length != 1)
{
    Console.Error.WriteLine("Choose a step from the README.");
    return 2;
}

switch (args[0])
{
    case "inventory-git-coverage":
    {
        var workspace = new[] { "pipeline", "notebook", "dashboard" };
        var git = new[] { "pipeline", "notebook" };
        var untracked = workspace.Except(git).ToArray();
        Check(untracked.SequenceEqual(["dashboard"]), "Untracked: " + string.Join(", ", untracked));
        break;
    }
    case "check-a-deployment-receipt":
    {
        var receipt = new { source = "a17", validation = "passed" };
        Show(receipt);
        Check(receipt.source == "a17" && receipt.validation == "passed", "Receipt matches the reviewed commit");
        break;
    }
    case "assign-operational-follow-up":
    {
        Show(new { schedule = "data ops", connection = "workspace admin", secretAccess = "identity team" });
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
