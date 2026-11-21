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
    case "compare-workflows":
    {
        Show(new { Bicep = new[] { "Azure", "Azure deployment records", "what-if" }, Terraform = new[] { "multiple providers", "team-owned state backend", "plan" } });
        break;
    }
    default:
        Console.Error.WriteLine($"Unknown demo step: {args[0]}");
        return 2;
}
return 0;

static void Show<T>(T value) => Console.WriteLine(JsonSerializer.Serialize(value, new JsonSerializerOptions { WriteIndented = true }));
