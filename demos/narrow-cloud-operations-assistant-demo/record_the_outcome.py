import json
inventory={"orders":"healthy"}
service="orders"
print(json.dumps({"tool":"get_status","service":service,"accepted":service in inventory,"result":inventory.get(service)}))
