#!/bin/bash

# Optimize Docker image and deploy
# Usage: ./optimize-and-deploy.sh

set -e

echo "🚀 Docker Image Optimization & Deployment"
echo "=========================================="

# Step 1: Build optimized image
echo "📦 Step 1: Building optimized Docker image..."
./scripts/build-docker-final.sh 1.0-optimized test

if [ $? -ne 0 ]; then
    echo "❌ Failed to build optimized image"
    exit 1
fi

# Step 2: Show size comparison
echo ""
echo "📊 Step 2: Size comparison"
echo "Original image (test:1.0):"
docker images test:1.0 --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" 2>/dev/null || echo "  Not found"

echo "Optimized image (test:1.0-optimized):"
docker images test:1.0-optimized --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" 2>/dev/null || echo "  Not found"

# Step 3: Update docker-compose if needed
echo ""
echo "📝 Step 3: Checking docker-compose.yaml..."
if grep -q "test:1.0-optimized" docker-compose.yaml; then
    echo "✅ docker-compose.yaml already uses optimized image"
else
    echo "🔄 Updating docker-compose.yaml to use optimized image..."
    sed -i 's/image: test:1.0/image: test:1.0-optimized/g' docker-compose.yaml
    echo "✅ Updated docker-compose.yaml"
fi

# Step 4: Deploy
echo ""
echo "🚀 Step 4: Deploying with optimized image..."
echo "Stopping existing containers..."
docker-compose down

echo "Starting with optimized image..."
docker-compose up -d

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "📊 Summary:"
    echo "  🎯 Image optimized and deployed"
    echo "  🌐 Application available at: http://localhost:3009"
    echo "  📦 Using optimized image: test:1.0-optimized"
    echo ""
    echo "🔍 Check status:"
    echo "  docker-compose ps"
    echo "  docker-compose logs app"
else
    echo "❌ Deployment failed"
    exit 1
fi