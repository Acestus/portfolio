# Azure Key Vault secrets in a Python application

From the portfolio root, create the demo repo under `/tmp/acestus-video-demos/`. Run the remaining commands from the new repo, or open its README in Neovim.

~~~fish
dotnet run --file scripts/SeedDemo.cs -- key-vault-secrets-python-demo
~~~


[Read the portfolio guide](https://acestus.com/docs/video-key-vault-secrets-python/).

Use .NET 11 and a mock vault with a dummy value. The linked article describes the Python SDK. This recording exercise shows the same access boundary in C#. Run one line at a time in fish.

## 1. Show the role boundary

Compare a demo identity with secret read permission against an anonymous identity.

~~~fish
dotnet run --file Demo.cs -- show-the-role-boundary
~~~

## 2. Verify allowed read

Compare the dummy result without printing it.

~~~fish
dotnet run --file Demo.cs -- verify-allowed-read
~~~

## 3. Verify denied read

Show the unauthorized identity receives no value.

~~~fish
dotnet run --file Demo.cs -- verify-denied-read
~~~
