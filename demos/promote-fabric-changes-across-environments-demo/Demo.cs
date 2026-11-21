using System.Text.Json;

if (args.Length != 1)
{
    Console.Error.WriteLine("Choose a step from the README.");
    return 2;
}

switch (args[0])
{
    case "identify-the-candidate":
    {
        var payload = System.Text.Encoding.UTF8.GetBytes("sample-pipeline-v2");
        Console.WriteLine(Convert.ToHexString(System.Security.Cryptography.SHA256.HashData(payload)).ToLowerInvariant());
        break;
    }
    case "carry-the-same-digest":
    {
        var digest = Convert.ToHexString(System.Security.Cryptography.SHA256.HashData("sample-pipeline-v2"u8));
        var receipts = new[] { "dev", "stg", "prd" }.Select(stage => new { stage, source = "a17", digest }).ToArray();
        Show(receipts);
        Check(receipts.Select(receipt => receipt.digest).Distinct().Count() == 1, "All stages use one digest");
        break;
    }
    case "reject-stale-evidence":
    {
        var selected = (Commit: "a17", Attempt: 2);
        var receipt = (Commit: "a17", Attempt: 1);
        Check(selected != receipt, "Promotion blocked because the receipt belongs to attempt 1");
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
