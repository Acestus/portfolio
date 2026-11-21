using System.Text.Json;

if (args.Length != 1)
{
    Console.Error.WriteLine("Choose a step from the README.");
    return 2;
}

switch (args[0])
{
    case "converge-an-existing-host":
    {
        var path = Path.GetTempFileName();
        try
        {
            bool Apply()
            {
                if (File.ReadAllText(path) == "workers=4") return false;
                File.WriteAllText(path, "workers=4");
                return true;
            }
            var changes = new[] { Apply(), Apply() };
            Show(changes);
            Check(changes.SequenceEqual([true, false]), "Only the first convergence changed the host");
        }
        finally { File.Delete(path); }
        break;
    }
    case "build-a-replacement-image":
    {
        var scratch = Directory.CreateTempSubdirectory("image-demo-");
        try
        {
            var oldImage = Path.Combine(scratch.FullName, "image-v1");
            var newImage = Path.Combine(scratch.FullName, "image-v2");
            File.WriteAllText(oldImage, "workers=2");
            File.WriteAllText(newImage, "workers=4");
            Show(new { previous = File.ReadAllText(oldImage), selected = File.ReadAllText(newImage) });
        }
        finally { scratch.Delete(recursive: true); }
        break;
    }
    case "compare-recovery-paths":
    {
        var images = new Dictionary<string, string> { ["v1"] = "workers=2", ["v2"] = "workers=4" };
        var converged = "workers=2";
        Check(converged == images["v1"], "Both recovery paths restore workers=2");
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
