before=[30,30,30]
after=[24,24,24]
print("Baseline:",sum(before),"After:",sum(after),"Difference:",sum(before)-sum(after))
assert sum(before)-sum(after)==18
