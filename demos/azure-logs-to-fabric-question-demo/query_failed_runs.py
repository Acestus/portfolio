import sqlite3
db=sqlite3.connect(":memory:")
db.execute("create table events(pipeline,status)")
db.executemany("insert into events values(?,?)",[("orders","failed"),("orders","failed"),("inventory","ok")])
rows=db.execute("select pipeline,count(*) from events where status=? group by pipeline",("failed",)).fetchall()
print(rows)
assert rows==[("orders",2)]
