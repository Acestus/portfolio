choices={"Bicep":("Azure only","Azure deployment records","what-if"),"Terraform":("Azure plus another provider","team-owned state backend","plan")}
print(choices)
assert len({choice[1] for choice in choices.values()})==2
