resolved=True
approved=False
decision="close" if resolved else "renew" if approved else "review"
print("Decision:",decision)
assert decision=="close"
