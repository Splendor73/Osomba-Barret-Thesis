# User Cleanup Utility Guide

This guide explains how to use the `cleanup_user.py` script to perform a "Total Reset" of a user's account across both AWS Cognito and the RDS PostgreSQL database. This is primarily used for testing the end-to-end registration and onboarding flows.

## Why This is Needed

The Osomba backend uses **Just-In-Time (JIT) Provisioning**. If you delete a user in Cognito but the record remains in RDS, the next time that email signs up, the backend will **re-link** the new Cognito ID to the old RDS record. 

This means the `is_onboarded` flag will remain `True`, and you won't be able to test the onboarding screen.

## Requirements

1.  **Python Environment**: You must have the backend virtual environment active and `boto3` installed.
2.  **AWS Profile**: You must have a valid AWS profile configured in `~/.aws/credentials` (e.g., `Heston_Hamilton`).
3.  **Database Access**: The script uses the settings in your `backend/.env` file. Ensure `POSTGRES_SERVER` is accessible (e.g., via the SSH tunnel if targeting production/staging).

## Usage

Run the script from the **backend root directory**:

```bash
cd backend
PYTHONPATH=. venv/bin/python scripts/cleanup_user.py <user-email> --profile <aws-profile>
```

### Example
```bash
PYTHONPATH=. venv/bin/python scripts/cleanup_user.py tester@example.com --profile Heston_Hamilton
```

## What the Script Does

1.  **Cognito Deletion**: Searches the User Pool for a user with the matching email and permanently deletes the identity.
2.  **RDS Deletion**: Deletes the row from the `users` table matching the email.

## ⚠️ Warnings

*   **Destructive Action**: This action cannot be undone. All user data, including their role, profile, and (if applicable) associated marketplace activity, will be lost.
*   **Foreign Key Constraints**: If the user has active orders, products, or auctions, the RDS deletion may fail due to foreign key constraints. This script is intended for resetting accounts during development and onboarding testing.
*   **Production Safety**: Always double-check the email address and your active `.env` configuration before running this script to avoid accidental deletion of real user data.
