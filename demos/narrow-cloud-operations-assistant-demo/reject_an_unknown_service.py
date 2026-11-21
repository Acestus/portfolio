lookup={"orders":"healthy"}.get
print(lookup("billing","rejected"))
assert lookup("billing","rejected")=="rejected"
