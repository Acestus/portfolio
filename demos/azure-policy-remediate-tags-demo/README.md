# Azure Policy that fixes missing tags

[Read the portfolio guide](https://acestus.com/docs/video-azure-policy-remediate-tags/).

Local model of a modify policy and remediation task. Python 3 only. Run one line at a time in fish.

## 1. Find the missing tag

Start with a sample resource whose tags omit the required owner.

~~~fish
python3 find_the_missing_tag.py
~~~

## 2. Preview remediation

Apply the sample change to a copy to show exactly what the task would write.

~~~fish
python3 preview_remediation.py
~~~

## 3. Recheck compliance

Show that presence and correctness are separate checks.

~~~fish
python3 recheck_compliance.py
~~~
