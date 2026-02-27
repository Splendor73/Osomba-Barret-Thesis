# Osomba Marketplace: Development Workflow

This guide details daily tasks, deployment procedures, and common troubleshooting steps.

---

## 1. Daily Development Routine

1. **Update Repository**: `git pull origin main`
2. **Start SSH Tunnel**: (Required for DB access) See [Setup Guide](setup.md#option-a-cli-tunnel)
3. **Activate Venv**: `source backend/venv/bin/activate`
4. **Run Backend**: `cd backend && PYTHONPATH=. uvicorn app.main:app --reload`
5. **Run Mobile**: `cd mobile && flutter run`

---

## 2. Deployment (Backend)

We use **AWS Elastic Beanstalk** for hosting the FastAPI backend.

### Deploy to Staging
```bash
cd backend
eb deploy osomba-marketplace-env
```

### View Cloud Logs
```bash
eb logs osomba-marketplace-env
# OR for full logs if truncated:
aws elasticbeanstalk retrieve-environment-info --environment-name osomba-marketplace-env --info-type bundle
```

---

## 3. Database & Infrastructure Maintenance

### Running Tools via Bastion Host
For manual database cleanup or running Python scripts directly inside the AWS VPC:
1. **SSH into Bastion**: `ssh -i "osomba-marketplace-key.pem" ec2-user@54.152.166.203`
2. **Execute Tools**: From here, you can run `psql` or diagnostic scripts against the RDS endpoint.

### Running Migrations (Alembic)

When you modify models in `app/models/`, you must update the database schema.

### Workflow
1. **Create Migration**:
   ```bash
   cd backend
   PYTHONPATH=. venv/bin/alembic revision --autogenerate -m "description"
   ```
2. **Apply Migration**: (Requires active SSH tunnel)
   ```bash
   PYTHONPATH=. venv/bin/alembic upgrade head
   ```
3. **Rollback**: `alembic downgrade -1`

---

## 4. Common Workflow Summary

| Action | Command (from `backend/`) |
| :--- | :--- |
| **Connect to DB** | `ssh -i ... -L 5433:...:5432 ... -N` (Separate terminal) |
| **Run Tests** | `PYTHONPATH=. venv/bin/pytest` |
| **Start Server** | `PYTHONPATH=. venv/bin/uvicorn app.main:app --reload` |
| **Migrate DB** | `PYTHONPATH=. venv/bin/alembic upgrade head` |

---

## 5. Useful Commands Cheat Sheet

| Category | Command | Purpose |
| :--- | :--- | :--- |
| **AWS** | `aws sts get-caller-identity` | Verify IAM identity |
| **EB** | `eb status` | Check environment health |
| **DB** | `psql -h localhost -p 5433 -U Osomba_db -d postgres` | CLI DB access |
| **Amplify**| `npx ampx sandbox --identifier <id>` | Sync cloud sandbox |
| **Git** | `git status --ignored` | Check ignored files |

---

## 5. Troubleshooting

### Build System Failures
- **iOS (CocoaPods)**: 
  ```bash
  cd mobile/ios && pod deintegrate && pod install
  ```
- **Android (Gradle)**:
  ```bash
  cd mobile/android && ./gradlew clean
  ```
- **General Flutter**: `flutter clean && flutter pub get`

### Backend 500/502 Errors
- Check `eb logs`. Look for Python stack traces in `web.stdout.log`.
- Common cause: Missing package in `requirements.txt`.

### Database Issues
- **Connection Refused**: Ensure SSH tunnel is running on port `5433`.
- **Missing Tables**: Run `alembic upgrade head` or `curl -X POST [URL]/init-db`.
- **"Onboarding Skipped"**: Use the [User Cleanup Utility](../maintenance/testing-cleanup.md) to reset test accounts in both Cognito and RDS.

### JIT Provisioning
- Verify your Cognito JWT is passed in the `Authorization: Bearer <token>` header.
- Check `backend_dev.log` for SQLAlchemy unique constraint errors.

---

## 6. Log Categories (AWS EB)

- **`web.stdout.log`**: Standard output from your FastAPI application (print statements, error traces).
- **`nginx/error.log`**: Web server errors (e.g., "Connection Refused" if the app crashed).
- **`eb-engine.log`**: Infrastructure and deployment events (useful if `eb deploy` fails).

---

## 7. Security Best Practices

1. **Never commit secrets**: Use `.env` for local keys and Elastic Beanstalk Environment Variables for cloud secrets.
2. **Key Rotation**: Rotate IAM access keys every 90 days.
3. **Database Access**: Always use an SSH tunnel; never enable public access to RDS.
4. **Code Reviews**: Check for hardcoded credentials before merging any PR.

