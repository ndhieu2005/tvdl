#!/bin/bash

# Build Ultra-Optimized Docker image
# Usage: ./build-docker-ultra.sh [IMAGE_TAG] [IMAGE_NAME]
# Example: ./build-docker-ultra.sh 1.0-ultra test

set -e

IMAGE_TAG=${1:-"1.0-ultra"}
IMAGE_NAME=${2:-"test"}
FULL_IMAGE_NAME="${IMAGE_NAME}:${IMAGE_TAG}"

echo "🚀 Building ULTRA-OPTIMIZED Docker image"
echo "📦 Image Name: ${IMAGE_NAME}" 
echo "🏷️  Image Tag: ${IMAGE_TAG}"
echo "📦 Full Image: ${FULL_IMAGE_NAME}"
echo "🎯 Target: Maximum size reduction (~300MB)"

# Load environment variables
if [ -f .env.production ]; then
    source .env.production
    echo "✅ Loaded .env.production"
else
    echo "⚠️  Using default values"
    export DATABASE_URL="mysql://admin:Admin@12@db:3306/tvdl2"
    export STORAGE_ENDPOINT="http://minio:9000"
    export STORAGE_ACCESS_KEY="minioadmin"
    export STORAGE_SECRET_KEY="minioadmin"
    export STORAGE_BUCKET="tvdl2"
    export NEXT_PUBLIC_SITE_URL="http://localhost:3009"
    export NEXT_PUBLIC_ENVIRONMENT="development"
    export NODE_ENV="production"
fi

# Override for local development
export NEXT_PUBLIC_SITE_URL="http://localhost:3009"
export NEXT_PUBLIC_ENVIRONMENT="development"

echo "🔧 Configuration:"
echo "   DATABASE_URL: ${DATABASE_URL}"
echo "   STORAGE_ENDPOINT: ${STORAGE_ENDPOINT}"
echo "   SITE_URL: ${NEXT_PUBLIC_SITE_URL}"

# Clean up any dangling images first
echo "🧹 Cleaning up dangling images..."
docker image prune -f

# Build with ultra-optimized Dockerfile
echo "🏗️  Building with ultra-optimized Dockerfile..."
docker build \
    --build-arg DATABASE_URL="${DATABASE_URL}" \
    --build-arg STORAGE_ENDPOINT="${STORAGE_ENDPOINT}" \
    --build-arg STORAGE_ACCESS_KEY="${STORAGE_ACCESS_KEY}" \
    --build-arg STORAGE_SECRET_KEY="${STORAGE_SECRET_KEY}" \
    --build-arg STORAGE_BUCKET="${STORAGE_BUCKET}" \
    --build-arg NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL}" \
    --build-arg NEXT_PUBLIC_ENVIRONMENT="${NEXT_PUBLIC_ENVIRONMENT}" \
    --build-arg NODE_ENV="${NODE_ENV}" \
    --tag "${FULL_IMAGE_NAME}" \
    --file Dockerfile.ultra-optimized \
    .

if [ $? -eq 0 ]; then
    echo "✅ Ultra-optimized Docker image built successfully!"
    
    # Show size comparison
    echo ""
    echo "📊 Image Size Comparison:"
    docker images | grep -E "(REPOSITORY|test)" | head -10
    
    # Calculate size reduction
    ORIGINAL_SIZE=$(docker images test:1.0 --format "table {{.Size}}" | tail -n +2 | head -1)
    NEW_SIZE=$(docker images ${FULL_IMAGE_NAME} --format "table {{.Size}}" | tail -n +2 | head -1)
    
    echo ""
    echo "📈 Size Analysis:"
    echo "   Original (test:1.0): ${ORIGINAL_SIZE:-"N/A"}"
    echo "   Ultra-optimized: ${NEW_SIZE:-"N/A"}"
    
    echo ""
    echo "🚀 Ready to use:"
    echo "   docker run -p 3009:3000 ${FULL_IMAGE_NAME}"
    echo "   or update docker-compose.yaml to use: ${FULL_IMAGE_NAME}"
    
    echo ""
    echo "💡 Ultra-optimizations applied:"
    echo "   ✓ Standalone Next.js output"
    echo "   ✓ Multi-layer consolidation"
    echo "   ✓ Aggressive cache cleaning"
    echo "   ✓ Minimal runtime dependencies"
    echo "   ✓ Single-stage production build"
    echo "   ✓ Optimized layer ordering"
    
else
    echo "❌ Failed to build ultra-optimized image"
    exit 1
fi