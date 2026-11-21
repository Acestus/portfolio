from datetime import date
expiry=date(2026,12,1)
print([(str(day),day<expiry) for day in [date(2026,11,28),expiry]])
