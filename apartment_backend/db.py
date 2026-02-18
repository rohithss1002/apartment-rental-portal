import psycopg2
import os

conn = psycopg2.connect(
    host=f"/cloudsql/{os.getenv('INSTANCE_CONNECTION_NAME')}",
    database=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD")
)
