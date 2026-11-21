# Promoting Fabric changes safely across environments

[Read the portfolio guide](https://acestus.com/docs/video-promote-fabric-changes-across-environments/).

Local release evidence exercise. Python 3 only. Run one line at a time in fish.

## 1. Identify the candidate

Hash one sample definition package and point out the digest used for promotion.

~~~fish
python3 identify_the_candidate.py
~~~

## 2. Carry the same digest

Compare the candidate identity recorded at the three sample stages.

~~~fish
python3 carry_the_same_digest.py
~~~

## 3. Reject stale evidence

Demonstrate why a receipt from an older attempt blocks promotion.

~~~fish
python3 reject_stale_evidence.py
~~~
