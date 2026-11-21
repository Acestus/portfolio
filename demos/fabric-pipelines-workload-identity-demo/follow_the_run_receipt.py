trigger={"http":202,"run":"demo-17"}
status={"demo-17":"Succeeded"}
print(trigger, status)
assert trigger["http"]==202 and status[trigger["run"]]=="Succeeded"
