required={"schedule","connection","region"}
print("Before:",required-{"connection","region"},"After:",required-{"schedule","connection","region"})
assert required-{"connection","region"}=={"schedule"}
