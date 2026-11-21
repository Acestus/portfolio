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
    case "compare-federated-subjects":
    {
        const string expected = "repo:example-org/github-actions-azure-oidc-demo:environment:dev";
        var candidates = new[] { expected, "repo:example-org/github-actions-azure-oidc-demo:ref:refs/heads/example" };
        Show(candidates.Select(subject => new { subject, matches = subject == expected }));
        break;
    }
    default:
        Console.Error.WriteLine($"Unknown demo step: {args[0]}");
        return 2;
}
return 0;

static void Show<T>(T value) => Console.WriteLine(JsonSerializer.Serialize(value, new JsonSerializerOptions { WriteIndented = true }));
