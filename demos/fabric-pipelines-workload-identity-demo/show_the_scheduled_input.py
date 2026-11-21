schedule={"utc":"06:00","pipeline":"daily-orders","input":"sample-orders.csv"}
print(schedule)
assert schedule["pipeline"]=="daily-orders"
