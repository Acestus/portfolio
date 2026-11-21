source={"schedule":"06:00 UTC","connection":"demo-dev","region":"test"}
target={"connection":"demo-stg","region":"test"}
print("Changed:",{key:(value,target.get(key)) for key,value in source.items() if target.get(key)!=value})
assert "schedule" not in target
