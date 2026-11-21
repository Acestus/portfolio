vault={"demo-secret":"dummy-value"}
get=lambda principal,key:vault.get(key) if principal=="demo-app" else None
assert get("anonymous","demo-secret") is None
print("PASS: unauthorized identity received no value")
