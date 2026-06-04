#!/bin/bash

# Build Ultra-Optimized Docker image (Target: <400MB)
# Usage: ./build-docker-ultra-optimized.sh [IMAGE_TAG] [IMAGE_NAME]
# Example: ./build-docker-ultra-optimized.sh 1.0-ultra test-ultra

set -e

IMAGE_TAG=${1:-"1.0-ultra"}
IMAGE_NAME=${2:-"test-ultra"}
FULL_IMAGE_NAME="${IMAGE_NAME}:${IMAGE_TAG}"

echo "🚀 Building ULTRA-OPTIMIZED Docker image"
echo "📦 Image Name: ${IMAGE_NAME}" 
echo "🏷️  Image Tag: ${IMAGE_TAG}"
echo "📦 Full Image: ${FULL_IMAGE_NAME}"
echo "🎯 Target: <400MB (80% reduction from 834MB)"

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

# Clean up before build
echo "🧹 Cleaning up before build..."
docker system prune -f --filter "until=24h" || true

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
    --no-cache \
    .

if [ $? -eq 0 ]; then
    echo "✅ Ultra-optimized Docker image built successfully!"
    
    # Show size comparison
    echo ""
    echo "📊 Image Size Comparison:"
    echo "Before optimization:"
    docker images | grep -E "(test.*1\.0)" | head -5
    echo ""
    echo "After ultra-optimization:"
    docker images "${FULL_IMAGE_NAME}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
    
    # Calculate size reduction
    OLD_SIZE=$(docker images test:1.0 --format "{{.Size}}" 2>/dev/null || echo "N/A")
    NEW_SIZE=$(docker images "${FULL_IMAGE_NAME}" --format "{{.Size}}")
    
    echo ""
    echo "📈 Optimization Results:"
    echo "   Original size: ${OLD_SIZE}"
    echo "   Optimized size: ${NEW_SIZE}"
    
    echo ""
    echo "🚀 Ready to use:"
    echo "   docker run -p 3009:3000 ${FULL_IMAGE_NAME}"
    
    echo ""
    echo "💡 Ultra optimizations applied:"
    echo "   ✓ Multi-stage build with minimal layers"
    echo "   ✓ Production-only dependencies"
    echo "   ✓ Standalone Next.js output"
    echo "   ✓ Cleaned npm cache and temp files"
    echo "   ✓ Removed build dependencies after use"
    echo "   ✓ Minimal Alpine base image"
    echo "   ✓ dumb-init for proper signal handling"
    echo "   ✓ Non-root user security"
    
    # Test the image
    echo ""
    echo "🧪 Testing the optimized image..."
    docker run --rm -d --name test-ultra-container -p 3010:3000 "${FULL_IMAGE_NAME}" || true
    sleep 5
    
    if curl -f http://localhost:3010 >/dev/null 2>&1; then
        echo "✅ Image test successful - application is running!"
        docker stop test-ultra-container >/dev/null 2>&1 || true
    else
        echo "⚠️  Image test failed - please check the application"
        docker stop test-ultra-container >/dev/null 2>&1 || true
    fi
    
else
    echo "❌ Failed to build ultra-optimized image"
    exit 1
fi