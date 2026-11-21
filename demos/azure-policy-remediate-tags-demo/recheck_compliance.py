tags={"owner":"unknown"}
print("Present:","owner" in tags,"Matches inventory:",tags["owner"]=="demo-team")
assert "owner" in tags and tags["owner"]!="demo-team"
