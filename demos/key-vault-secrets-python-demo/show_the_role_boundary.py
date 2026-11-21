roles={"demo-app":{"secrets/get"},"anonymous":set()}
print({identity:"secrets/get" in permissions for identity,permissions in roles.items()})
