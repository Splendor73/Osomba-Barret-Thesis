#!/bin/bash
set -euo pipefail

shopt -s nullglob

for py in /var/app/venv/staging-*/bin/python; do
  site_packages_dir="$(dirname "$(dirname "$py")")/lib64/python3.11/site-packages"
  rm -rf "$site_packages_dir"/pip "$site_packages_dir"/pip-*.dist-info
  "$py" -m ensurepip --upgrade
done
