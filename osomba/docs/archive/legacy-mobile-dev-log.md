# Sandbox Workflow & Context Log (Legacy)

**Note:** The `auth_sandbox` project has been successfully integrated into the main `mobile/` directory as of Feb 11, 2026. The sandbox directory has been decommissioned. This log is preserved for historical context and troubleshooting.

## Environment Context
- **Operating System:** Linux
- **IAM Profile:** `osomba-amplify-dev`
- **AWS Region:** `us-east-1`
- **Sandbox Identifier:** `auth-spike`
- **Sandbox Namespace (Stack Name):** `amplify-authsandbox-authspike-sandbox-041fb886c6`
- **Cognito User Pool ID:** `us-east-1_sud3xMSAk`
- **Cognito App Client ID:** `54h64f872dhjsk9qcj2256isle`
- **Identity Pool ID:** `us-east-1:183550bd-0422-45b5-8c87-d0d11c0a8c43`
- **AppSync API Endpoint:** `https://nthnm73ysjbztityfytrf5skj4.appsync-api.us-east-1.amazonaws.com/graphql`

## Infrastructure Discovery & Integration (KPS-125)

### 1. RDS Database
- **Instance Identifier:** `osomba-marketplace-db`
- **Endpoint:** `osomba-marketplace-db.cyxecuk22kgr.us-east-1.rds.amazonaws.com`
- **Port:** `5432`
- **Security Group:** `osomba-marketplace-rds-sg` (`sg-0695268a35fadee27`)
- **VPC ID:** `vpc-0138a30270a6341e7`
- **Auth Info:** 
    - **DB Name:** `postgres`
    - **User:** `Osomba_db`
    - **Note:** Inbound rules allow access from specific EC2 Security Groups and CIDRs.

### 2. EC2 Tunnel Candidates (Same VPC)
These instances have the necessary Security Group authorization to reach the RDS instance:
- **Instance ID:** `i-05bf0f6775d09df8e`
    - **Public IP:** `54.152.166.203`
    - **Security Group:** `osomba-marketplace-ec2-sg` (`sg-0d1f1e8a7858074bf`)
    - **Key Pair:** `osomba-marketplace-key`
    - **Note:** Verified reachable on port 22. Matches the local `osomba-marketplace-key.pem`.
- **Instance ID:** `i-0048906dbe0010d13`
    - **Public IP:** `3.222.192.23`
    - **Security Group:** `awseb-e-guq4ppq3tm-stack-AWSEBSecurityGroup-IONGiHnnIwvj` (`sg-02aac38ae871da7e0`)
    - **Key Pair:** `osomba-key`
    - **Note:** Primary Elastic Beanstalk backend instance. Missing local `osomba-key.pem`.

### 3. Connection Troubleshooting
- **Direct Access:** Currently blocked by Security Group rules (IP whitelist needed).
- **SSH Tunneling:** 
    - **Success:** Confirmed `i-05bf0f6775d09df8e` is reachable using `osomba-marketplace-key.pem`.
    - **Tunnel Command:** `ssh -i osomba-marketplace-key.pem -L 5433:osomba-marketplace-db.cyxecuk22kgr.us-east-1.rds.amazonaws.com:5432 ec2-user@54.152.166.203`
    - **Note:** Use `localhost:5433` for local DB tools or backend configuration.

### 4. Integration Summary (Completed Feb 11, 2026)
- **RSA JWT Verification**: Implemented offline signature validation in `backend/app/core/security.py` using cached JWKS from Cognito.
- **JIT User Provisioning**: Integrated automatic "skeleton" record creation in the `get_current_user` FastAPI dependency.
- **Database Refactor**:
    - Added `cognito_sub` and `is_onboarded` fields to `users` table.
    - Dropped the deprecated `hashed_password` column.
    - Applied Alembic migrations (`7d4f3c07cd7b`, `45e64518a465`) to the RDS instance.
- **Verification**:
    - Unit tests (`tests/test_jit.py`, `tests/test_security_robustness.py`) verified 100% success.
    - Live E2E test with real Cognito token confirmed full flow functionality.
- **Decommissioning**:
    - Removed `/register` and `/login` endpoints from `auth.py`.
    - Removed `UserProfile` from Amplify Data schema.
    - Removed `post-confirmation` Lambda trigger from Amplify backend.

## Workflow Modifications & Commands

### 1. Custom Email Templates (KPS-127)
- **Problem:** Cognito was using a generic "Verify your new account" message for both new sign-ups and password resets.
- **Solution:** Implemented a `CustomMessage` Lambda trigger (`auth-custom-messages`) to provide distinct subjects and bodies based on the trigger source.
- **Trigger Sources Handled:**
    - `CustomMessage_ForgotPassword`: "Reset your Osomba password"
    - `CustomMessage_SignUp` / `CustomMessage_ResendCode`: "Welcome to Osomba! Verify your account"

### 2. Owner Reassignment Protection (KPS-126)
- **Problem:** Owners could potentially reassign their records to other users by updating the `owner` field.
- **Solution:** Applied field-level authorization to the `owner` field in `UserProfile` model, restricting it to `read` and `delete` operations for the owner.

### 3. Profile Creation Idempotency & Cleanup (KPS-126)
- **Improvement:** Added a check for existing profiles before allowing a new one to be created.
- **Improvement:** Used the Cognito `userId` as the primary key (`id`) for the `UserProfile` to ensure a 1:1 mapping between Auth users and Database records.
- **Utility:** Added a `_clearProfiles` function and UI button to allow developers to reset their own profile data during sandbox testing.

## Known Issues & Resolutions

### 1. Verification Code Not Received (KPS-127)
- **Issue:** Password reset requests for `support@osomba.com` did not result in an email delivery.
- **Root Cause:** Multiple sandbox stacks existed. The `amplify_outputs.dart` file was pointing to an empty User Pool (`us-east-1_aBhfQgU15`). Cognito "silently" failed the reset request because the user did not exist in that specific pool.
- **Resolution:**
    1. Regenerated outputs specifically for the correct stack: `npx ampx generate outputs --stack amplify-authsandbox-authspike-sandbox-041fb886c6 ...`
    2. Synced the schema using `npx ampx sandbox --identifier auth-spike`.
- **Additional Context:** A nested `auth_sandbox/auth_sandbox` directory was discovered, which contained a stale `amplify_outputs.dart` file. This contributed to configuration confusion. The redundant directory was removed and the build was cleaned.

- **Cleanup Instructions:**
    To remove the stale sandbox (`...4ea81f57ff`), perform the following in the AWS Console:
    1.  Log in to the AWS Console (Region: `us-east-1`).
    2.  Navigate to **CloudFormation**.
    3.  Locate the stack named `amplify-authsandbox-authspike-sandbox-4ea81f57ff`.
    4.  Select the stack and click **Delete**.
    5.  Confirm the deletion. This will remove the empty User Pool and associated resources.

## Project Scope & Targets
- **Target Platforms:** iOS, Android, Web. (Desktop is out of scope).
- **Session Persistence:**
    - On **Web (Chrome Debug)**: Session data is lost when `flutter run` is terminated because a temporary browser profile is used. Persistence is verified via "Hot Restart" or browser refresh (F5) while the process is active.
    - On **Mobile**: Session data persists across app restarts as expected.

## Workflow Modifications & Commands

### 1. Root `.gitignore` Conflict
The root directory's `.gitignore` contained a `lib/` entry (common in Python projects) which blocked access to the Flutter source code.
- **Action:** Removed `lib/` from the root `.gitignore`.

### 2. AWS Profile Configuration
Instead of using the default profile, a specific profile for this project was created.
- **Command:** `npx ampx configure profile` (Configured as `osomba-amplify-dev`)

### 3. Sandbox Deployment Command
To ensure the correct profile and identifier are used:
```bash
npx ampx sandbox 
  --identifier auth-spike 
  --profile osomba-amplify-dev 
  --outputs-format dart 
  --outputs-out-dir lib
```

### 4. Project Initialization
- Flutter project: `auth_sandbox`
- Amplify Gen 2 scaffolded within `auth_sandbox/`
- Dependencies added: `amplify_flutter`, `amplify_auth_cognito`, `amplify_authenticator`

## 5. Stashing build artifacts
$ git stash --all
Saved working directory and index state WIP on feature/heston-hamilton-auth: 33aac6a KPS-126: Refine profile creation and add cleanup utility in auth sandbox

When switching back to this branch, run `git stash pop` to return everything.
