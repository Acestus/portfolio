images={"v1":"workers=2","v2":"workers=4"}
host=images["v2"]
host="workers=2"
print("Converged:",host,"Image rollback:",images["v1"])
assert host==images["v1"]
