import json
request={"service":"orders","size":"small"}
assert request["size"] in ("small","medium")
print(json.dumps(request|{"logging":True,"environment":"development","review":"platform team"},indent=2))
