"""
File: scripts/cleanup_user.py
Purpose: Permanently delete a user from AWS Cognito and RDS Database for E2E testing.
Usage: PYTHONPATH=. venv/bin/python backend/scripts/cleanup_user.py <email> --profile <aws-profile>
WARNING: This is a DESTRUCTIVE action.
"""

import sys
import argparse
import boto3
from sqlalchemy import create_engine, text
from app.core.config import settings

def cleanup_user(email: str, profile: str):
    print(f"--- Starting Total Cleanup for: {email} ---")
    
    # 1. Initialize AWS Session
    try:
        session = boto3.Session(profile_name=profile, region_name=settings.aws_region)
        cognito = session.client('cognito-idp')
    except Exception as e:
        print(f"Error initializing AWS session: {e}")
        sys.exit(1)

    # 2. Delete from Cognito
    user_pool_id = settings.cognito_user_pool_id
    if not user_pool_id:
        print("Error: COGNITO_USER_POOL_ID not found in environment settings.")
        sys.exit(1)

    try:
        # We need to find the username (usually same as email or sub) in the pool
        print(f"Searching for user in Cognito Pool: {user_pool_id}...")
        response = cognito.list_users(
            UserPoolId=user_pool_id,
            Filter=f'email = "{email}"'
        )
        
        users = response.get('Users', [])
        if not users:
            print(f"User {email} not found in Cognito. Skipping Cognito deletion.")
        else:
            cognito_username = users[0]['Username']
            print(f"Deleting user {cognito_username} from Cognito...")
            cognito.admin_delete_user(
                UserPoolId=user_pool_id,
                Username=cognito_username
            )
            print("Successfully deleted from Cognito.")
            
    except Exception as e:
        print(f"Error during Cognito deletion: {e}")
        # We continue to RDS even if Cognito fails, just in case

    # 3. Delete from RDS
    try:
        print(f"Connecting to database to delete record for {email}...")
        engine = create_engine(settings.database_url)
        with engine.connect() as connection:
            # We use a transaction to ensure atomicity
            with connection.begin():
                # Note: This simple delete might fail if there are foreign key constraints (Orders, Products, etc.)
                # For the purpose of testing onboarding, these records usually don't exist yet.
                result = connection.execute(
                    text("DELETE FROM users WHERE email = :email"),
                    {"email": email}
                )
                if result.rowcount > 0:
                    print(f"Successfully deleted {result.rowcount} record(s) from RDS 'users' table.")
                else:
                    print(f"No record found in RDS for email: {email}")
                    
    except Exception as e:
        print(f"Error during RDS deletion: {e}")
        print("Tip: If this is a Foreign Key constraint error, you may need to manually delete associated orders/products first.")

    print(f"--- Cleanup process finished for {email} ---")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Clean up a user from Cognito and RDS.")
    parser.add_argument("email", help="Email of the user to delete")
    parser.add_argument("--profile", required=True, help="AWS Profile name to use")
    
    args = parser.parse_args()
    cleanup_user(args.email, args.profile)
