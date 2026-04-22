#!/bin/bash
set -euo pipefail

RUNNER="/usr/local/bin/osomba-support-purge.sh"
CRON_FILE="/etc/cron.d/osomba-support-purge"

cat > "$RUNNER" <<'EOF'
#!/bin/bash
set -euo pipefail

APP_DIR="/var/app/current"
if [ ! -d "$APP_DIR" ]; then
  exit 0
fi

PYTHON_BIN="$(find /var/app/venv -path '*/bin/python' | head -n 1)"
if [ -z "$PYTHON_BIN" ]; then
  PYTHON_BIN="/usr/bin/python3"
fi

cd "$APP_DIR"
export PYTHONPATH="/var/app/current:${PYTHONPATH:-}"
"$PYTHON_BIN" scripts/purge_deleted_support_content.py >> /var/log/osomba-support-purge.log 2>&1
EOF

chmod 755 "$RUNNER"

cat > "$CRON_FILE" <<EOF
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

0 3 * * * root $RUNNER
EOF

chmod 644 "$CRON_FILE"
