import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

user = os.getenv('MYSQL_USER', 'root')
pwd = os.getenv('MYSQL_PASSWORD', '')
host = os.getenv('MYSQL_HOST', 'localhost')
dbname = os.getenv('MYSQL_DATABASE', 'laika_club3_v2')

engine = create_engine(f"mysql+pymysql://{user}:{pwd}@{host}:3306/{dbname}")

with engine.connect() as conn:
    res = conn.execute(text("DESCRIBE venues"))
    for row in res:
        print(row)
    
    print("\nCountries:")
    res = conn.execute(text("SELECT * FROM countries"))
    for row in res:
        print(row)
