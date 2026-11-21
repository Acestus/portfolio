vault={"demo-secret":"dummy-value"}
get=lambda principal,key:vault.get(key) if principal=="demo-app" else None
assert get("demo-app","demo-secret")=="dummy-value"
print("PASS: expected dummy value returned")
