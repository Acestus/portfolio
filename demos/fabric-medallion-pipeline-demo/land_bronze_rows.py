import csv
rows=list(csv.DictReader(["order_id,amount","a,12","b,","c,8"]))
print("Bronze:", [{"ingested":"2026-11-21T06:00Z", **row} for row in rows])
assert len(rows)==3
