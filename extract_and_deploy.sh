#!/bin/bash
set -e

DEPLOY_DIR="/opt/vaultkey"
CHUNKS_DIR="/opt/vaultkey-deploy-chunks"

echo "=== VaultKey Deployment Script ==="

# Create deploy directory
mkdir -p $DEPLOY_DIR

# Combine chunks
echo "Combining chunks..."
cat $CHUNKS_DIR/chunk_* > /tmp/vaultkey-deploy.b64

# Decode base64
echo "Decoding..."
base64 -d /tmp/vaultkey-deploy.b64 > /tmp/vaultkey-deploy.tar.gz

# Extract
echo "Extracting to $DEPLOY_DIR..."
tar -xzf /tmp/vaultkey-deploy.tar.gz -C $DEPLOY_DIR

# Clean up
rm -f /tmp/vaultkey-deploy.b64 /tmp/vaultkey-deploy.tar.gz

echo "Files extracted successfully:"
ls -la $DEPLOY_DIR/

# Build and start Docker containers
echo "Building and starting Docker containers..."
cd $DEPLOY_DIR
docker-compose up -d --build

echo "Waiting for containers to start..."
sleep 10

echo "Container status:"
docker-compose ps

echo "=== Deployment Complete ==="
