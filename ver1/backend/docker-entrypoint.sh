#!/bin/sh
set -e

echo "[entrypoint] Waiting for database and syncing Prisma schema..."

RETRIES=30
until npx prisma db push --skip-generate >/tmp/dbpush.log 2>&1; do
  RETRIES=$((RETRIES - 1))
  if [ "$RETRIES" -le 0 ]; then
    echo "[entrypoint] Database never became ready. Last output:"
    cat /tmp/dbpush.log
    exit 1
  fi
  echo "[entrypoint] Database not ready yet, retrying in 3s ($RETRIES left)..."
  sleep 3
done

echo "[entrypoint] Schema is in sync."
echo "[entrypoint] Starting server..."
exec npm start
