# Developer Setup Guide - Osomba Marketplace

This guide walks you through setting up the Osomba Marketplace project on your local machine, connecting to AWS resources, and accessing the database.

---

## 1. Prerequisites

- **OS**: macOS, Linux, or Windows with WSL2 (Recommended)
- **Python 3.11+ (3.12 tested)**
- **Flutter SDK** (for mobile development)
- **AWS CLI** installed ([Install Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html))
- **EB CLI** installed (`pip install awsebcli`)
- **pgAdmin 4** (For visual database management)
- **Git**

---

## 2. AWS Account Setup

### IAM Credentials
Contact the project administrator to receive your IAM user credentials:
- AWS Access Key ID
- AWS Secret Access Key
- Account ID: `281505305629`
- Region: `us-east-1`

### Configure AWS CLI
```bash
aws configure
# Enter your keys, set region to us-east-1, and output to json
```

### Verify Access
```bash
aws sts get-caller-identity
```

---

## 3. Repository & Backend Setup

### Clone the Repository
```bash
git clone https://github.com/hestonhamilton/osomba.git
cd osomba
```

### Install Python Dependencies
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install httpx  # Required for testing
```

### Configure Environment Variables
Create a `.env` file in the `backend` directory:
```bash
cp .env.example .env
```

#### Key Variables Reference
| Variable | Purpose | Local Dev Value |
|----------|---------|-----------------|
| `POSTGRES_SERVER` | DB Hostname | `localhost` |
| `POSTGRES_PORT` | DB Port | `5433` |
| `POSTGRES_USER` | DB Username | `Osomba_db` |
| `POSTGRES_DB` | DB Name | `postgres` |
| `AWS_REGION` | AWS Region | `us-east-1` |

---

## 4. Database Access

The RDS database is in a private subnet. Access is provided via an SSH tunnel through the management EC2 instance.

### Step 1: Get the EC2 Key Pair
Obtain `osomba-marketplace-key.pem` and place it in the project root.
```bash
chmod 400 osomba-marketplace-key.pem
```

#### Platform Specifics for Permissions:
- **macOS/Linux**: `chmod 400` is sufficient.
- **Windows (WSL2)**: Ensure the file is inside the WSL filesystem, not `/mnt/c/`.
- **Windows (Native)**: Right-click > Properties > Security > Advanced > Disable inheritance > Remove all but your user (set to Read).

### Option A: CLI Tunnel (Recommended)
Run this in a dedicated terminal and keep it open:
```bash
ssh -i "osomba-marketplace-key.pem" \
  -N -L 5433:osomba-marketplace-db.cyxecuk22kgr.us-east-1.rds.amazonaws.com:5432 \
  ec2-user@54.152.166.203
```

#### Connectivity Logic:
```text
┌────────────────────────┐
│  Local Machine         │
│  (FastAPI / pgAdmin)   │
└───────────┬────────────┘
            │ SSH Tunnel (Port 5433 -> 5432)
            ▼
┌────────────────────────┐
│  EC2 Management Instance│
│  (Bastion Host)        │
└───────────┬────────────┘
            │ Internal AWS VPC
            ▼
┌────────────────────────┐
│  RDS PostgreSQL        │
│  (Private Subnet)      │
└────────────────────────┘
```

### Option B: pgAdmin 4 Setup (Visual)
1. **Register Server**: Name it `Osomba Marketplace DB`.
2. **Connection Tab**:
   - Host: `osomba-marketplace-db.cyxecuk22kgr.us-east-1.rds.amazonaws.com`
   - Port: `5432`
   - Maintenance DB: `postgres`
   - User: `Osomba_db` / Pass: `Osomba2026!`
3. **SSH Tunnel Tab**:
   - Enable "Use SSH tunneling".
   - Tunnel host: `54.152.166.203`
   - Username: `ec2-user`
   - Authentication: `Identity file` -> select your `.pem` key.
   - *Tip: If pgAdmin asks for a tunnel password, leave it blank.*

#### Expected Tables (Public Schema)
Once connected via pgAdmin, you should see the following tables in the `public` schema: 
`users`, `products`, `categories`, `auctions`, `bids`, `orders`, `reviews`, `messages`, `notifications`, and `payments`.


---

## 5. Mobile App Setup

### Install Dependencies
```bash
cd mobile
flutter pub get
npm install
```

### Sync AWS Infrastructure
Sync your local environment with your personal Amplify sandbox:
```bash
npx ampx sandbox --identifier <your-unique-id> --profile <your-aws-profile>
```

### Configure API Endpoint
Edit `lib/utils/constants.dart`:
```dart
class AppConstants {
  // For production/staging:
  static const String baseUrl = 'http://osomba-marketplace-env.eba-dvimsjm2.us-east-1.elasticbeanstalk.com/api/v1';
  
  // For local testing:
  // static const String baseUrl = 'http://localhost:8000/api/v1';
}
```

---

## 6. Verification

### Test Backend
```bash
cd backend
PYTHONPATH=. venv/bin/uvicorn app.main:app --reload
# Expected: {"status":"healthy"} at http://localhost:8000/health
```

### Test Mobile
```bash
cd mobile
flutter run
```

---

**Next Steps:** See the [Development Workflow Guide](workflow.md).
