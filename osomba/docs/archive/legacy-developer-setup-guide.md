# Developer Setup Guide - Osomba Marketplace

This guide walks you through setting up the Osomba Marketplace project on your local machine, connecting to AWS resources, and accessing the database via pgAdmin.

---

## Prerequisites

- **macOS, Linux, or Windows** with WSL2
- **Python 3.11+**
- **Flutter SDK** (for mobile development)
- **AWS CLI** installed ([Install Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html))
- **EB CLI** installed (`pip install awsebcli`)
- **pgAdmin 4** ([Download](https://www.pgadmin.org/download/))
- **Git**

---

## 1. AWS Account Setup

### Get Your IAM Credentials

Contact the project administrator to create an IAM user for you. You'll receive:
- AWS Access Key ID
- AWS Secret Access Key
- Account ID: `281505305629`
- Region: `us-east-1`

### Configure AWS CLI

```bash
aws configure
```

Enter when prompted:
- **AWS Access Key ID:** `[your-access-key]`
- **AWS Secret Access Key:** `[your-secret-key]`
- **Default region name:** `us-east-1`
- **Default output format:** `json`

### Verify Access

```bash
aws sts get-caller-identity
```

You should see your IAM user information.

---

## 2. Clone the Repository

```bash
git clone [repository-url]
cd osomba
```

---

## 3. Backend Setup

### Install Python Dependencies

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` with these values:

```env
# Database Connection
POSTGRES_SERVER=osomba-marketplace-db.cyxecuk22kgr.us-east-1.rds.amazonaws.com
POSTGRES_USER=Osomba_db
POSTGRES_PASSWORD=Osomba2026!
POSTGRES_DB=postgres

# AWS Credentials (for S3, SES, etc.)
AWS_ACCESS_KEY_ID=[your-access-key]
AWS_SECRET_ACCESS_KEY=[your-secret-key]
AWS_REGION=us-east-1
S3_BUCKET_NAME=osomba-marketplace-assets

# M-Pesa (Optional - for payment testing)
MPESA_API_KEY=[ask-admin]
```

#### Environment Variable Explanations

| Variable | Purpose | Where It's Used |
|----------|---------|-----------------|
| `POSTGRES_SERVER` | RDS database hostname | Database connection in `app/db/database.py` |
| `POSTGRES_USER` | Database username | Authentication to PostgreSQL |
| `POSTGRES_PASSWORD` | Database password | Authentication to PostgreSQL |
| `POSTGRES_DB` | Database name (schema) | Which database to connect to |
| `AWS_ACCESS_KEY_ID` |Your IAM access key | S3 uploads, SES emails |
| `AWS_SECRET_ACCESS_KEY` | Your IAM secret key | S3 uploads, SES emails |
| `AWS_REGION` | AWS region for resources | All AWS service calls |
| `S3_BUCKET_NAME` | S3 bucket for product images | Media uploads |
| `MPESA_API_KEY` | M-Pesa payment gateway key | Payment processing (future) |



### Test Local Backend

```bash
uvicorn app.main:app --reload
```

Visit: `http://localhost:8000` - You should see `{"status":"healthy"}`

---

## 4. Mobile App Setup

### Install Dependencies

```bash
cd ../mobile
# Install Flutter packages
flutter pub get

# Install Infrastructure tools (Amplify CLI)
npm install
```

### AWS Infrastructure Setup
The mobile app owns its own Amplify backend (Cognito, Lambda triggers). You must sync your local environment with your personal sandbox:

```bash
npx ampx sandbox --identifier <your-unique-id> --profile osomba-amplify-dev
```

### Configure API Endpoint

Edit `lib/utils/constants.dart`:

```dart
class AppConstants {
  static const String baseUrl = 'http://osomba-marketplace-env.eba-dvimsjm2.us-east-1.elasticbeanstalk.com/api/v1';
  // For local testing against your FastAPI server:
  // static const String baseUrl = 'http://localhost:8000/api/v1';
}
```

### Run the App

```bash
# iOS
flutter run -d ios

# Android
flutter run -d android
```

---

## 5. Database Access via pgAdmin

The RDS database is in a **private subnet**, so you need an SSH tunnel through the EC2 instance to access it.

### Step 1: Get the EC2 Key Pair

Contact the project administrator for the `osomba-marketplace-key.pem` file. Save it to your project root:

```bash
# Place the key in the project root
mv ~/Downloads/osomba-marketplace-key.pem /path/to/osomba/

# Set correct permissions
chmod 400 osomba-marketplace-key.pem
```

> ⚠️ **Important:** This `.pem` file is in `.gitignore`. Never commit it to Git!

### Step 2: Configure pgAdmin

pgAdmin has a built-in SSH tunnel feature that automatically handles the connection through the EC2 instance.

1. **Open pgAdmin 4**
2. **Right-click "Servers"** → **Register** → **Server**

Configure the following tabs:

#### **General Tab:**
- **Name**: `Osomba Marketplace DB`

#### **Connection Tab:**
- **Host name/address**: `osomba-marketplace-db.cyxecuk22kgr.us-east-1.rds.amazonaws.com`
- **Port**: `5432`
- **Maintenance database**: `postgres`
- **Username**: `Osomba_db`
- **Password**: `Osomba2026!`
- ☑️ **Save password**

#### **SSL Tab:**
- **SSL mode**: `Require`

#### **SSH Tunnel Tab:**
- ☑️ **Use SSH tunneling**: Check this box to enable
- **Tunnel host**: `54.152.166.203`
- **Tunnel port**: `22`
- **Username**: `ec2-user`
- **Authentication**: Select **Identity file** from dropdown
- **Identity file**: Browse to your `.pem` file location:
  ```
  /path/to/osomba/osomba-marketplace-key.pem
  ```
- **Password**: Leave blank (the key file has no password)

3. **Click "Save"**

> **💡 What This Does:** When you connect, pgAdmin automatically creates an SSH tunnel through your EC2 instance to reach the RDS database. No manual terminal commands needed!

#### SSH Tunnel Visual Diagram

```
┌────────────────────────┐
│  pgAdmin (Your Mac)    │
│  Built-in SSH Client   │
└───────────┬────────────┘
            │ SSH Tunnel
            │ (Automatic)
            ▼
┌────────────────────────┐
│  EC2 Instance          │
│  54.152.166.203        │
│  (Jump Box)            │
└───────────┬────────────┘
            │ Within AWS VPC
            │ (Private Network)
            ▼
┌────────────────────────┐
│  RDS PostgreSQL        │
│  osomba-marketplace-db │
│  Port 5432             │
└────────────────────────┘
```

### Step 4: View Tables

Expand: **Servers** → **Osomba Marketplace DB** → **Databases** → **postgres** → **Schemas** → **public** → **Tables**

You should see:
- `users`
- `products`
- `categories`
- `auctions`
- `bids`
- `orders`
- `reviews`
- `messages`
- `notifications`
- `payments`

---

## 6. Elastic Beanstalk Deployment

### Initialize EB CLI

```bash
cd backend
eb init
```

- Select region: `us-east-1`
- Select application: `osomba_marketplace`
- Do NOT create a new application
- Use existing environment: `osomba-marketplace-env`

### Deploy Changes

```bash
eb deploy osomba-marketplace-env
```

### View Logs

```bash
eb logs osomba-marketplace-env
```

### Check Environment Status

```bash
eb status osomba-marketplace-env
```

---

## 7. Common Issues & Troubleshooting

### Database Connection Issues

#### "Onboarding flow is skipped for new accounts"
**Cause:** You are using an email address that previously existed in the RDS database. The JIT provisioning logic re-linked your new Cognito account to the old RDS record.
**Solution:** Use the [User Cleanup Utility](./maintenance/testing-cleanup.md) to perform a "Total Reset" of the test account in both Cognito and RDS.

#### "Connection refused" in pgAdmin

**Symptoms:** Can't connect to database in pgAdmin, error message shows "connection refused"

**Cause:** pgAdmin's built-in SSH tunnel may have issues, or the EC2 instance is unreachable.

**Solution:**
1. **Check EC2 instance is accessible:**
   ```bash
   ssh -i "osomba-marketplace-key.pem" ec2-user@54.152.166.203 "echo 'EC2 is reachable'"
   ```
2. **Verify pgAdmin SSH Tunnel settings:**
   - Right-click server → Properties → SSH Tunnel tab
   - Confirm: Tunnel host = `54.152.166.203`, Username = `ec2-user`
   - Identity file path is correct
3. **Check your internet connection** - stable connection required for SSH tunnel

#### "Please enter the SSH Tunnel password"

**Symptoms:** pgAdmin asks for a password when connecting

**Cause:** The `.pem` key file has no password, but pgAdmin expects input.

**Solution:** 
- **Leave the password field blank** and click OK
- The key file (`osomba-marketplace-key.pem`) does not require a password


#### "SSL connection has been closed unexpectedly"

**Symptoms:** Connection works briefly then fails

**Cause:** Network instability or security group changes

**Solution:**
1. Check your internet connection is stable
2. Restart the SSH tunnel
3. Verify Security Groups in AWS Console haven't changed
4. Try connecting from a different network (VPN conflicts)

#### "Authentication failed for user Osomba_db"

**Symptoms:** Connection reaches database but can't log in

**Cause:** Wrong password in pgAdmin or `.env`

**Solution:**
- Double-check password is exactly: `Osomba2026!`
- No extra spaces or characters
- Ask admin if password was recently rotated

---

### SSH & Key File Issues

#### "Permission denied" for .pem file

**Symptoms:** `Permission denied (publickey)` when trying to SSH

**Solution:**
```bash
chmod 400 osomba-marketplace-key.pem

# Verify permissions (should show -r--------)
ls -l osomba-marketplace-key.pem
```

#### "WARNING: UNPROTECTED PRIVATE KEY FILE!"

**Symptoms:** SSH refuses to use the key file

**Solution:** Key is too permissive
```bash
chmod 400 osomba-marketplace-key.pem
```

#### "Bad permissions" on Windows

**Symptoms:** Windows doesn't respect chmod

**Solution for Windows:**
1. Right-click `osomba-marketplace-key.pem` → Properties
2. Security tab → Advanced → Disable inheritance
3. Remove all users except your account
4. Give your account "Read" permission only

---

### Backend Local Development Issues

#### Backend can't connect to database locally

**Cause:** Your local environment can't reach AWS RDS directly (it's in a private subnet)

**Solution:** Use SSH tunnel for local development too:
```bash
# In .env, change to use the tunnel:
POSTGRES_SERVER=localhost
POSTGRES_PORT=5433  # Add this line

# Keep the SSH tunnel running while developing
```

#### "ModuleNotFoundError" when running backend

**Symptoms:** Python can't find installed packages

**Solution:**
```bash
# Ensure virtual environment is activated
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate      # Windows

# Re-install dependencies
pip install -r requirements.txt
```

#### "uvicorn: command not found"

**Symptoms:** Terminal doesn't recognize uvicorn command

**Solution:**
```bash
# Ensure venv is activated
source venv/bin/activate

# If still not working, install directly:
pip install uvicorn
```

---

### Elastic Beanstalk Deployment Issues

#### EB Deploy fails with health check errors

**Symptoms:** `eb deploy` completes but environment health is "Severe" or "Degraded"

**Solution:**
```bash
# Check recent events for specific error
eb events osomba-marketplace-env

# View detailed logs
eb logs osomba-marketplace-env

# Common fixes:
# 1. Missing dependency in requirements.txt
# 2. Database connection failure (check environment variables)
# 3. Application taking too long to start (increase timeout in .ebextensions)

# Last resort: Restart environment
eb restart osomba-marketplace-env
```

#### "You have not called eb init"

**Symptoms:** EB commands don't work

**Solution:**
```bash
cd backend
eb init
# Select region: us-east-1
# Select existing application: osomba_marketplace
# Environment: osomba-marketplace-env
```

#### Changes deployed but not showing up

**Symptoms:** `eb deploy` succeeds but code changes aren't live

**Solution:**
```bash
# Force a restart after deploy
eb deploy && eb restart

# Or check if you're on the right branch
git status
git branch
```

---

### Mobile App Issues

#### "Flutter command not found"

**Symptoms:** Terminal doesn't recognize `flutter`

**Solution:**
```bash
# Verify Flutter is installed
which flutter

# If not installed, download Flutter SDK:
# https://docs.flutter.dev/get-started/install

# Add Flutter to PATH (add to ~/.zshrc or ~/.bashrc):
export PATH="$PATH:/path/to/flutter/bin"
```

#### "Unable to connect to backend" in mobile app

**Symptoms:** App can't fetch data from API

**Solution:**
1. **Check API URL** in `mobile/lib/core/constants.dart`:
   ```dart
   static const String apiBaseUrl = 'http://osomba-marketplace-env.eba-dvimsjm2.us-east-1.elasticbeanstalk.com/api/v1';
   ```
2. **Test backend is reachable:**
   ```bash
   curl http://osomba-marketplace-env.eba-dvimsjm2.us-east-1.elasticbeanstalk.com/health
   # Should return: {"status":"healthy"}
   ```
3. **Check CORS settings** in `backend/app/main.py`
4. **Try hot restart:** Press `Shift+R` in Flutter terminal

#### "Gradle build failed" on Android

**Symptoms:** Android build fails with Gradle errors

**Solution:**
```bash
cd mobile/android
./gradlew clean

cd ..
flutter clean
flutter pub get
flutter run
```

#### CocoaPods issues on iOS

**Symptoms:** iOS build fails with CocoaPods errors

**Solution:**
```bash  
cd mobile/ios
pod deintegrate
pod install

cd ..
flutter clean
flutter pub get
flutter run
```

---

###General Development Issues

#### "Tables are missing in database"

**Symptoms:** API returns errors about missing tables

**Solution:**
```bash
# Option 1: Via API endpoint
curl -X POST http://osomba-marketplace-env.eba-dvimsjm2.us-east-1.elasticbeanstalk.com/init-db

# Option 2: SSH into EC2 and run Alembic
eb ssh osomba-marketplace-env
cd /var/app/current
source /var/app/venv/*/bin/activate
alembic upgrade head
exit
```

#### Git asks for credentials repeatedly

**Symptoms:** Every git command requires username/password

**Solution:**
```bash
# Use SSH instead of HTTPS for remote
git remote set-url origin git@github.com:username/osomba.git

# Or cache credentials for HTTPS:
git config --global credential.helper cache
```

---

### Platform-Specific Notes

#### macOS
- Use `source venv/bin/activate` for Python virtual env
- SSH tunnel works out of the box
- Xcode required for iOS development

#### Windows (WSL2 Recommended)
- Install WSL2: `wsl --install`
- Use Linux commands within WSL
- Alternatively use Git Bash for Unix-like commands
- Key file permissions require Windows-specific steps (see above)

#### Linux
- Same commands as macOS
- Ensure `postgresql-client` installed for `psql`
- May need to install `libpq-dev` for Python database drivers

---

## 8. Useful Commands Cheat Sheet

### AWS & EB
```bash
# Check AWS identity
aws sts get-caller-identity

# List EB environments
eb list

# SSH into EB instance
eb ssh osomba-marketplace-env

# Set environment variables
eb setenv KEY=VALUE
```

### Database
```bash
# Connect via psql (through tunnel)
psql -h localhost -p 5433 -U Osomba_db -d postgres

# Test database connection
PYTHONPATH=. python scripts/check_db.py
curl -X POST http://osomba-marketplace-env.eba-dvimsjm2.us-east-1.elasticbeanstalk.com/init-db
```

### Git
```bash
# Check what's ignored
git status --ignored

# Never commit these!
git check-ignore -v .env *.pem
```

---

## 9. Development Workflow

### Daily Routine

1. **Pull latest changes**
   ```bash
   git pull origin main
   ```

2. **Sync AWS Infrastructure**
   ```bash
   cd mobile
   npx ampx sandbox --identifier <your-id> --profile osomba-amplify-dev
   ```

3. **Activate virtual environment**
   ```bash
   source backend/venv/bin/activate
   ```

3. **Start SSH tunnel** (if accessing database)
   ```bash
   ssh -i "osomba-marketplace-key.pem" \
     -N -L 5433:osomba-marketplace-db.cyxecuk22kgr.us-east-1.rds.amazonaws.com:5432 \
     ec2-user@54.152.166.203
   ```

4. **Run local backend**
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

5. **Run mobile app**
   ```bash
   cd mobile
   flutter run
   ```

### Before Pushing Code

```bash
# Test locally
python -m pytest backend/tests/

# Format code
black backend/
isort backend/

# Deploy to staging
eb deploy osomba-marketplace-env

# Verify health
eb status osomba-marketplace-env
```

---

## 10. Architecture Overview

```
┌─────────────────┐
│  Mobile App     │
│  (Flutter)      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Elastic Beanstalk (EB)         │
│  osomba-marketplace-env         │
│  - FastAPI Backend              │
│  - Python 3.11                  │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  RDS PostgreSQL 16.3            │
│  osomba-marketplace-db          │
│  - Private subnet               │
│  - SSL required                 │
└─────────────────────────────────┘
         ▲
         │ (SSH Tunnel)
         │
┌─────────────────────────────────┐
│  Standalone EC2                 │
│  osomba-marketplace-instance    │
│  - For database access          │
│  - Public IP: 54.152.166.203    │
└─────────────────────────────────┘
```

---

## 11. Security Best Practices

1. **Never commit secrets:**
   - `.env` files
   - `.pem` key files
   - AWS credentials

2. **Key rotation:**
   - Rotate IAM keys every 90 days
   - Update `.env` when keys change

3. **Database access:**
   - Always use SSH tunnel for database
   - Never enable public access to RDS

4. **Code reviews:**
   - Check for hardcoded credentials before merging
   - Use GitHub secret scanning

---

## 12. Getting Help

### Documentation
- [Backend API Docs](./backend_documentation.md)
- [Mobile App Docs](./architecture/mobile.md)
- [AWS Infrastructure](./architecture/infrastructure.md)

### Contacts
- **Project Lead:** [Name]
- **Backend Lead:** [Name]
- **Mobile Lead:** [Name]

### Common Issues
Check existing issues: [GitHub Issues Link]

---

## Appendix: EC2 & RDS Details

### EC2 Instance
- **Instance ID:** `i-05bf0f6775d09df8e`
- **Public IP:** `54.152.166.203`
- **Private IP:** `172.31.26.15`
- **Instance Type:** `t3.micro`
- **Key Pair:** `osomba-marketplace-key.pem`

### RDS Database
- **DB Identifier:** `osomba-marketplace-db`
- **Endpoint:** `osomba-marketplace-db.cyxecuk22kgr.us-east-1.rds.amazonaws.com`
- **Port:** `5432`
- **Engine:** PostgreSQL 16.3
- **Instance Class:** `db.t4g.micro`
- **Storage:** 20 GB (encrypted)

### Security Groups
- **RDS SG:** `sg-0695268a35fadee27` (osomba-marketplace-rds-sg)
- **EB SG:** `sg-02aac38ae871da7e0`
- **EC2 SG:** [Ask admin]

---

**Last Updated:** February 2026
**Version:** 1.0
