event=5
refresh=20
print("Observed lag:",refresh-event,"minutes; budget for ingestion and retention")
assert refresh-event==15
