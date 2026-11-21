items={"pipeline","notebook","dashboard"}
tracked={"pipeline","notebook"}
print("Untracked:", sorted(items-tracked))
assert items-tracked=={"dashboard"}
