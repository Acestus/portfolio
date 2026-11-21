using Xunit;

public class Acceptance
{
    private static int Count => Hello.BaseCount + Feature("Feature3") + Feature("Feature4");
    private static int Feature(string name) => typeof(Hello).Assembly.GetType(name) is null ? 0 : 1;

    private static void Expect(string message, int count)
    {
        Assert.Equal(message, Hello.Message);
        Assert.Equal(count, Count);
    }

    [Fact] public void Baseline() => Expect("Hello World", 6);
    [Fact] public void BeforeHotfixDevelopment() => Expect("Hello World", 8);
    [Fact] public void FirstHotfix() => Expect("Hello World hotfix 1", 7);
    [Fact] public void SecondHotfix() => Expect("Hello World hotfix 2", 8);
    [Fact] public void FeaturesRestored() => Expect("Hello World hotfix 2", 10);
}
