import csv
rows=list(csv.DictReader(["order_id,amount","a,12","b,","c,8"]))
clean=[int(row["amount"]) for row in rows if row["amount"].isdigit()]
rejected=[row["order_id"] for row in rows if not row["amount"].isdigit()]
print("Silver:",clean,"Quarantine:",rejected)
assert clean==[12,8] and rejected==["b"]
