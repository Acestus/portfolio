"""Create the standalone hotfix-demo repository in a new directory."""
from pathlib import Path
import subprocess
import sys

root = Path(sys.argv[1] if len(sys.argv) > 1 else "hotfix-demo").resolve()
root.mkdir()
(root / ".gitignore").write_text("bin/\nobj/\n.stages/\n")

def run(*args):
    subprocess.run(args, cwd=root, check=True)

def git(*args):
    run("git", *args)

git("init", "-b", "main")
git("config", "user.name", "Hotfix Demo")
git("config", "user.email", "hotfix-demo@example.invalid")
git("config", "commit.gpgsign", "false")
(root / "HotfixDemo.csproj").write_text("""<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net11.0</TargetFramework>
    <IsTestProject>true</IsTestProject>
    <DefaultItemExcludes>$(DefaultItemExcludes);.stages/**</DefaultItemExcludes>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.14.1" />
    <PackageReference Include="xunit" Version="2.9.3" />
    <PackageReference Include="xunit.runner.visualstudio" Version="3.1.5" PrivateAssets="all" />
  </ItemGroup>
</Project>
""")
(root / "Hello.cs").write_text('public static class Hello { public static string Message { get; } = "Hello World"; public const int BaseCount = 6; }\n')
(root / "Acceptance.cs").write_text("""using Xunit;

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
""")

(root / "README.md").write_text("# Hotfix demo\n\nFollow the [trunk branching runbook](https://github.com/Acestus/portfolio/blob/main/docs/runbooks/trunk-branching-hotfix.md).\n")

git("add", ".")
git("commit", "-m", "Create Hello World baseline and acceptance checks")
for tag in ("release-0", "stg", "prd"):
    git("tag", tag)
for number in (3, 4):
    feature = f"Feature{number}.cs"
    (root / feature).write_text(f"public static class Feature{number} {{ }}\n")
    git("add", feature)
    git("commit", "-m", f"Add feature {number}")
    git("tag", f"feature-{number}")
git("tag", "dev")
for stage in ("dev", "stg", "prd"):
    git("worktree", "add", "--detach", f".stages/{stage}", stage)
print(f"Ready: {root}")
