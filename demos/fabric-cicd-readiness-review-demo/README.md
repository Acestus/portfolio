# A practical Microsoft Fabric CI/CD readiness review

[Read the portfolio guide](https://acestus.com/docs/video-fabric-cicd-readiness-review/).

Local Fabric review worksheet. Python 3 only. Run one line at a time in fish.

## 1. Inventory Git coverage

Compare the workspace inventory with the definitions in Git.

~~~fish
python3 inventory_git_coverage.py
~~~

## 2. Check a deployment receipt

Compare the reviewed commit with the commit listed on the sample receipt.

~~~fish
python3 check_a_deployment_receipt.py
~~~

## 3. Assign operational follow-up

Record the missing schedule, connection, and secret checks with owners.

~~~fish
python3 assign_operational_follow_up.py
~~~
