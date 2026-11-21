# Configuration management versus rebuilding the image

From the portfolio root, create the demo repo under `/tmp/acestus-video-demos/`. Run the remaining commands from the new repo, or open its README in Neovim.

~~~fish
dotnet run --file scripts/SeedDemo.cs -- configuration-management-vs-image-rebuild-demo
~~~


[Read the portfolio guide](https://acestus.com/docs/video-configuration-management-vs-image-rebuild/).

Use .NET 11 and temporary local files as stand-ins for a host and images. Run one line at a time in fish.

## 1. Converge an existing host

Apply the same desired setting twice and show that only the first run changes the file.

~~~fish
dotnet run --file Demo.cs -- converge-an-existing-host
~~~

## 2. Build a replacement image

Create a new artifact and keep the previous one available.

~~~fish
dotnet run --file Demo.cs -- build-a-replacement-image
~~~

## 3. Compare recovery paths

Show the same expected setting after convergence or image rollback.

~~~fish
dotnet run --file Demo.cs -- compare-recovery-paths
~~~
