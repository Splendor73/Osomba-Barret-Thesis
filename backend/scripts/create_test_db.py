import sys
from sqlalchemy import create_engine
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Connect to the default 'postgres' db to execute database creation commands
# Adjust these credentials if your local postgres requires different ones.
url_default = "postgresql+psycopg2://postgres:password@localhost:5432/postgres"

# We use a dedicated test database name to prevent overwriting realistic dev data
target_db = "marketplace_test"

print(f"Connecting to 'postgres' to create test database '{target_db}'...")

try:
    engine = create_engine(url_default)
    connection = engine.raw_connection()
    # Required to CREATE DATABASE outside of a transaction block
    connection.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = connection.cursor()
    
    # Check if db exists
    cursor.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{target_db}'")
    exists = cursor.fetchone()
    
    if not exists:
        cursor.execute(f"CREATE DATABASE {target_db}")
        print(f"✅ Test Database '{target_db}' created successfully!")
    else:
        print(f"✅ Test Database '{target_db}' already exists.")
        
    cursor.close()
    connection.close()
    
except Exception as e:
    print(f"❌ Failed to create database: {e}")
    desc = str(e)
    if "does not exist" in desc and "postgres" in desc:
         print("\nCRITICAL: The default 'postgres' database cannot be connected to.")
         print("Make sure your local Postgres server is running and accessible.")
         print("You may need to update the credentials in this script to match your local setup.")
    sys.exit(1)
