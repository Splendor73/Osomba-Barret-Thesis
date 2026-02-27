import psycopg2
from app.core.config import settings

def list_tables():
    try:
        conn = psycopg2.connect(
            host=settings.POSTGRES_SERVER,
            user=settings.POSTGRES_USER,
            password=settings.POSTGRES_PASSWORD,
            dbname=settings.POSTGRES_DB
        )
        cur = conn.cursor()
        
        # List all databases
        print("--- DATABASES ---")
        cur.execute("SELECT datname FROM pg_database WHERE datistemplate = false;")
        dbs = cur.fetchall()
        for db in dbs:
            print(f"- {db[0]}")
            
        # List tables in current DB (postgres)
        print(f"\n--- TABLES IN '{settings.POSTGRES_DB}' ---")
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
        """)
        tables = cur.fetchall()
        if not tables:
            print("(No tables found)")
        else:
            for table in tables:
                print(f"- {table[0]}")

        conn.close()

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_tables()
