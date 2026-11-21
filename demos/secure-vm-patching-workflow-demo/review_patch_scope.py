fleet={"vm-a":"linux","vm-b":"linux","vm-c":"windows"}
targets=sorted(name for name,os in fleet.items() if os=="linux")
print("02:00 UTC Linux targets:",targets)
assert targets==["vm-a","vm-b"]
