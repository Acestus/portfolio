from statistics import mean
samples=[3,4,20,5]
print("Mean CPU percent:",mean(samples),"Peak:",max(samples))
assert mean(samples)==8
