import csv
amounts=[int(row["amount"]) for row in csv.DictReader(["order_id,amount","a,12","b,","c,8"]) if row["amount"].isdigit()]
print("Orders:",len(amounts),"Total:",sum(amounts))
assert (len(amounts),sum(amounts))==(2,20)
