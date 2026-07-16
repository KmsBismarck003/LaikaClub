from pyspark.sql import SparkSession
from pyspark.sql.functions import col, count, sum, avg

spark = SparkSession.builder.master("local[1]").getOrCreate()
df = spark.createDataFrame([(1, "A", 10.0), (2, "B", 20.0)], ["id", "category", "price"])

try:
    df.groupBy(["id"])
except Exception as e:
    print("groupBy:", type(e).__name__, e)

try:
    df.select(["id"])
except Exception as e:
    print("select:", type(e).__name__, e)

try:
    df.drop(["id"])
except Exception as e:
    print("drop:", type(e).__name__, e)

try:
    count(["id"])
except Exception as e:
    print("count:", type(e).__name__, e)

try:
    df.fillna(["id"])
except Exception as e:
    print("fillna:", type(e).__name__, e)
