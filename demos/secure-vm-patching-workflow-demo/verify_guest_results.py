results={"vm-a":"Installed","vm-b":"Failed","vm-c":"No report"}
followup=[name for name,result in results.items() if result!="Installed"]
print("Follow-up:",followup)
assert followup==["vm-b","vm-c"]
