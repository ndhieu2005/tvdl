#!/bin/bash

# Build Final Optimized Docker image for Development/Testing
# Usage: ./build-docker-final.sh [IMAGE_TAG] [IMAGE_NAME]
# Example: ./build-docker-final.sh 1.0-final test
# Note: For production, use build-docker-production-optimized.sh

set -e

IMAGE_TAG=${1:-"1.0-final"}
IMAGE_NAME=${2:-"test"}
FULL_IMAGE_NAME="${IMAGE_NAME}:${IMAGE_TAG}"

echo "🎯 Building FINAL OPTIMIZED Docker image for Development/Testing"
echo "📦 Image Name: ${IMAGE_NAME}" 
echo "🏷️  Image Tag: ${IMAGE_TAG}"
echo "📦 Full Image: ${FULL_IMAGE_NAME}"
echo "🎯 Target: ~680MB (60% reduction from 1.68GB)"
echo "⚠️  Note: For production, use build-docker-production-optimized.sh"

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

# Build with final optimized Dockerfile
echo "🏗️  Building with final optimized Dockerfile..."
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
    --file Dockerfile.final \
    .

if [ $? -eq 0 ]; then
    echo "✅ Final optimized Docker image built successfully!"
    
    # Show size comparison
    echo ""
    echo "📊 Image Size Comparison:"
    docker images | grep -E "(REPOSITORY|test)" | head -10
    
    echo ""
    echo "🚀 Ready to use:"
    echo "   docker run -p 3009:3000 ${FULL_IMAGE_NAME}"
    echo ""
    echo "📝 To update docker-compose.yaml:"
    echo "   Change 'image: test:1.0' to 'image: ${FULL_IMAGE_NAME}'"
    
    echo ""
    echo "💡 Final optimizations applied:"
    echo "   ✓ Multi-stage build with shared base"
    echo "   ✓ Separate dependencies stage"
    echo "   ✓ Standalone Next.js output"
    echo "   ✓ Minimal runtime dependencies"
    echo "   ✓ Optimized layer caching"
    echo "   ✓ Non-root user security"
    
else
    echo "❌ Failed to build final optimized image"
    exit 1
fi