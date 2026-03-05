import psycopg2
import os

def get_db_connection():
    instance = os.getenv("INSTANCE_CONNECTION_NAME")

    if instance:
        # Production: Google Cloud Run
        return psycopg2.connect(
            host=f"/cloudsql/{instance}",
            dbname=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD")
        )
    else:
        # Local development
        return psycopg2.connect(
            host=os.getenv("DB_HOST", "127.0.0.1"),
            port=os.getenv("DB_PORT", 5432),
            dbname=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD")
        )