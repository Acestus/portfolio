expected="repo:example-org/github-actions-azure-oidc-demo:environment:dev"
samples=[expected,"repo:example-org/github-actions-azure-oidc-demo:ref:refs/heads/example"]
print([(subject,subject==expected) for subject in samples])
assert [subject==expected for subject in samples]==[True,False]
