inventory={"owner":"data ops","dependencies":["nightly backup"]}
print(inventory)
assert inventory["dependencies"]
print("Decision: investigate with owner")
