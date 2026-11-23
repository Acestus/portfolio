if (args.Length == 0)
{
    Console.Error.WriteLine("Usage: dotnet run --file StorageNaming.cs -- <storage-account-name> [...]");
    return 2;
}

var exitCode = 0;
foreach (var name in args)
{
    var valid = name.Length is >= 3 and <= 24
        && name.All(character => character is (>= 'a' and <= 'z') or (>= '0' and <= '9'));

    if (valid)
    {
        Console.WriteLine($"PASS: {name} has valid storage account name syntax.");
    }
    else
    {
        Console.WriteLine($"FAIL: {name} must contain 3–24 lowercase ASCII letters or digits.");
        exitCode = 1;
    }
}

return exitCode;
