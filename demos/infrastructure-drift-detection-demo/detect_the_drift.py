import difflib
diff=list(difflib.unified_diff(["owner=demo-team"],["owner=manual-edit"],fromfile="declared",tofile="observed",lineterm=""))
print(*diff,sep=chr(10))
assert diff
