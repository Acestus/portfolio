exceptions={"vm-b":{"owner":"data ops","expires":"2026-12-01"}}
print("Ready:",sorted({"vm-a","vm-b"}-exceptions.keys()),"Deferred:",exceptions)
assert set(exceptions)=={"vm-b"}
