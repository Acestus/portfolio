using System.Text.Json;

if (args.Length != 1)
{
    Console.Error.WriteLine("Choose a step from the README.");
    return 2;
}

switch (args[0])
{
    case "review-patch-scope":
    {
        var fleet = new[] { (Name: "vm-a", Os: "linux"), (Name: "vm-b", Os: "linux"), (Name: "vm-c", Os: "windows") };
        Show(fleet.Where(vm => vm.Os == "linux").Select(vm => vm.Name));
        break;
    }
    case "apply-a-named-exception":
    {
        var targets = new[] { "vm-a", "vm-b" };
        var deferred = "vm-b";
        Show(new { ready = targets.Where(vm => vm != deferred), deferred, owner = "data ops", expires = "2026-12-01" });
        break;
    }
    case "verify-guest-results":
    {
        var results = new[] { (Vm: "vm-a", Result: "Installed"), (Vm: "vm-b", Result: "Failed"), (Vm: "vm-c", Result: "No report") };
        var followUp = results.Where(vm => vm.Result != "Installed").Select(vm => vm.Vm).ToArray();
        Check(followUp.SequenceEqual(["vm-b", "vm-c"]), "Follow-up: " + string.Join(", ", followUp));
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
