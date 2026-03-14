#!/usr/bin/env bash
set -e

echo "==> Installing dependencies..."
npm install -g pnpm
pnpm install --no-frozen-lockfile

echo "==> Building frontend..."
PORT=10000 BASE_PATH=/ pnpm --filter @workspace/cyber-arcade run build

echo "==> Building API server..."
pnpm --filter @workspace/api-server run build

echo "==> Pushing database schema..."
DATABASE_URL=$DATABASE_URL pnpm --filter @workspace/db run push

echo "==> Build complete!"
