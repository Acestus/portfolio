declared={"owner":"demo-team"}
observed={"owner":"demo-team","runtime_rows":5}
assert all(observed.get(k)==v for k,v in declared.items())
print("Tracked properties match; runtime rows outside scope")
