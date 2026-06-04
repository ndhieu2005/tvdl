#!/bin/bash

# Build Simple Optimized Docker image without database dependency
# Usage: ./build-docker-simple.sh [IMAGE_TAG] [IMAGE_NAME]
# Example: ./build-docker-simple.sh 1.0-simple test-simple

set -e

IMAGE_TAG=${1:-"1.0-simple"}
IMAGE_NAME=${2:-"test-simple"}
FULL_IMAGE_NAME="${IMAGE_NAME}:${IMAGE_TAG}"

echo "🚀 Building SIMPLE OPTIMIZED Docker image"
echo "📦 Image Name: ${IMAGE_NAME}" 
echo "🏷️  Image Tag: ${IMAGE_TAG}"
echo "📦 Full Image: ${FULL_IMAGE_NAME}"
echo "🎯 Target: <500MB (40% reduction from 834MB)"

# Use the existing Dockerfile.final but with optimized package.json
echo "🏗️  Building with existing Dockerfile.final..."
docker build \
    --build-arg DATABASE_URL="mysql://dummy:dummy@dummy:3306/dummy" \
    --build-arg STORAGE_ENDPOINT="http://dummy:9000" \
    --build-arg STORAGE_ACCESS_KEY="dummy" \
    --build-arg STORAGE_SECRET_KEY="dummy" \
    --build-arg STORAGE_BUCKET="dummy" \
    --build-arg NEXT_PUBLIC_SITE_URL="http://localhost:3009" \
    --build-arg NEXT_PUBLIC_ENVIRONMENT="development" \
    --build-arg NODE_ENV="production" \
    --tag "${FULL_IMAGE_NAME}" \
    --file Dockerfile.final \
    .

if [ $? -eq 0 ]; then
    echo "✅ Simple optimized Docker image built successfully!"
    
    # Show size comparison
    echo ""
    echo "📊 Image Size Comparison:"
    echo "Original image:"
    docker images test:1.0 --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}" 2>/dev/null || echo "Original image not found"
    echo ""
    echo "Simple optimized image:"
    docker images "${FULL_IMAGE_NAME}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
    
    echo ""
    echo "🚀 Ready to use:"
    echo "   docker run -p 3009:3000 ${FULL_IMAGE_NAME}"
    
    echo ""
    echo "💡 Simple optimizations applied:"
    echo "   ✓ Multi-stage build"
    echo "   ✓ Standalone Next.js output"
    echo "   ✓ Production dependencies only"
    echo "   ✓ Alpine base image"
    echo "   ✓ Non-root user security"
    
else
    echo "❌ Failed to build simple optimized image"
    exit 1
fi