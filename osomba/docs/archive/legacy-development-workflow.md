# Osomba Marketplace: Development Workflow

This guide details how to develop, deploy, and manage the Osomba Marketplace application within the AWS ecosystem.

## 1. Deployment Workflow (Backend)

We use **AWS Elastic Beanstalk** for deploying the backend code. The deployment process essentially updates the running version of the code on the cloud servers.

### Prerequisites (One-Time Setup)
Ensure you have the **EB CLI** installed and initialized in `backend/`:
```bash
cd backend
eb init
# Select region: us-east-1
# Select application: osomba-marketplace-env
```

### Steps to Deploy
1.  **Check Status:** Ensure your git repository is clean and you are on the correct branch.
    ```bash
    git status
    ```
2.  **Deploy Command:**
    ```bash
    eb deploy osomba-marketplace-env
    ```
    *   This zips your code (respecting `.gitignore` and `.ebignore`).
    *   Uploads it to S3.
    *   Updates the EC2 instances in your environment.
    *   Restart the application server.

3.  **Monitor Deployment:**
    The CLI will show progress events. If it fails, check logs immediately using:
    ```bash
    eb logs
    # OR for full logs if truncated
    aws elasticbeanstalk retrieve-environment-info --environment-name osomba-marketplace-env --info-type bundle
    ```

## 2. Database Management

Since the database is private (for security), you cannot connect to it directly from your laptop (e.g., using pgAdmin) **unless** you establish a secure tunnel.

### Option A: Using the Management EC2 Interface (Recommended for Scripts)
To run migration scripts or check connectivity:
1.  **SSH into the Standalone Instance:**
    ```bash
    ssh -i "path/to/osomba-marketplace-key.pem" ec2-user@<management-instance-public-ip>
    ```
2.  **Run Tools:**
    From here, you can run `psql` or python scripts that connect to the RDS endpoint.

### Option B: Running Migrations (Alembic)
Currently, database migrations (schema updates) should be run carefully.
*   **Ideally:** Configure your build pipeline or a `pre-deploy` hook in Elastic Beanstalk to run `alembic upgrade head`.
*   **Manually:** SSH into the EC2 instance, pull the latest code, and run alembic there against the RDS host.

## 3. Logs & Debugging

When things go wrong (e.g., 502 Bad Gateway), follow this checklist:

1.  **Application Logs (`web.stdout.log`):**
    *   Contains the output from your Python application (print statements, error stack traces).
    *   Access via: `eb logs`

2.  **Server Logs (`nginx/error.log`):**
    *   Shows if the web server (Nginx) cannot talk to your Python app.
    *   "Connection Refused" usually means your Python app crashed or isn't listening on port 8000.

3.  **Deployment Logs (`eb-engine.log`):**
    *   Shows what happened during the deployment process (installing `requirements.txt`, etc.).

## 4. Mobile App Connectivity

The mobile app connects to the **Live Environment URL** (or `localhost` for local development).
*   **Verify Configuration:** Check `mobile/lib/utils/constants.dart`.
*   **Class:** `AppConstants`
*   **Variable:** `baseUrl`
*   **Production Value:** `http://osomba-marketplace-env.eba-dvimsjm2.us-east-1.elasticbeanstalk.com/api/v1`

If you change the backend environment, you MUST update this URL in `AppConstants` and rebuild the application.
