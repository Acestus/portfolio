before={"stage":"demo"}
after=before|{"owner":"demo-team"}
print("Before:",before,"After:",after)
assert "owner" not in before and after["owner"]=="demo-team"
