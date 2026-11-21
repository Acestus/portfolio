receipts={"dev":("a17","v2"),"stg":("a17","v2"),"prd":("a17","v2")}
print(receipts)
assert len(set(receipts.values()))==1
