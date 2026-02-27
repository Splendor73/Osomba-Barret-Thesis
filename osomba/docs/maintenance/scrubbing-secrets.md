# Scrubbing Secrets from Git History

If a secret (API key, password, token, etc.) is accidentally committed to the repository, it must be removed from the git history immediately. Simply deleting the file or the line in a new commit is **not enough**, as the secret will still exist in previous commits.

This guide explains how to use `git-filter-repo` to scrub secrets.

## Prerequisites

We use `git-filter-repo`, which is a powerful tool for rewriting history.

1. **Install git-filter-repo**:
   If you have the backend environment set up, you can install it in the virtual environment:
   ```bash
   source backend/.venv/bin/activate
   pip install git-filter-repo
   ```

## Step-by-Step Guide

### 1. Identify the sensitive file(s)
Find the path to the file(s) containing the secret. For example: `.gemini/settings.json`.

### 2. Remove the file from history
Run the following command (ensure you are in the root of the repository):

```bash
# If using the backend venv
source backend/.venv/bin/activate
git-filter-repo --path <path-to-file> --invert-paths --force
```

**Note:** The `--force` flag is often required because `git-filter-repo` prefers to run on a fresh clone. 

### 3. Restore the Origin Remote
`git-filter-repo` removes the `origin` remote by default to prevent accidental pushes while you are rewriting history. You must add it back:

```bash
git remote add origin git@github.com:hestonhamilton/osomba.git
```

### 4. Verify the removal
Check the logs to ensure the file and its associated commits no longer contain the sensitive data:
```bash
git log --all -- <path-to-file>
```

### 5. Force Push (USE WITH CAUTION)
Once you have verified the history is clean, you will need to force push the changes to the remote. **Coordinate with your team before doing this**, as it will overwrite history for everyone on that branch.

```bash
git push origin <your-branch-name> --force
```

## CRITICAL: Rotate your Secrets
**Rewriting history does not "un-leak" the secret.** Once a secret has been pushed to a remote repository, you must assume it has been compromised. 

1. **Immediately revoke/invalidate the secret.**
2. **Generate a new one.**
3. **Ensure the new secret is NOT committed.** (Use `.env` files and ensure they are in `.gitignore`).

## Prevention
To prevent this in the future:
- Always use `.env` files for local development.
- Check `.gitignore` before committing new configuration files.
- Consider using tools like `git-secrets` or `trufflehog` to scan for secrets locally before pushing.
