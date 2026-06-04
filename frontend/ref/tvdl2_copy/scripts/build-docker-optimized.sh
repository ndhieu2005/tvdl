#!/bin/bash

# Build Optimized Docker image for Local Development/Testing
# Usage: ./build-docker-optimized.sh [IMAGE_TAG] [IMAGE_NAME]
# Example: ./build-docker-optimized.sh 1.0 test

set -e

IMAGE_TAG=${1:-"1.0"}
IMAGE_NAME=${2:-"test"}
FULL_IMAGE_NAME="${IMAGE_NAME}:${IMAGE_TAG}"

echo "🚀 Building OPTIMIZED Docker image"
echo "📦 Image Name: ${IMAGE_NAME}" 
echo "🏷️  Image Tag: ${IMAGE_TAG}"
echo "📦 Full Image: ${FULL_IMAGE_NAME}"
echo "🎯 Target: Reduced size (300-500MB vs 1.68GB)"

# Load environment variables from .env.production (or create local values)
if [ -f .env.production ]; then
    source .env.production
    echo "✅ Loaded .env.production"
else
    echo "⚠️  .env.production file not found, using default values"
    # Set default values for local development
    export DATABASE_URL="mysql://admin:Admin@12@db:3306/tvdl2"
    export STORAGE_ENDPOINT="http://minio:9000"
    export STORAGE_ACCESS_KEY="minioadmin"
    export STORAGE_SECRET_KEY="minioadmin"
    export STORAGE_BUCKET="tvdl2"
    export NEXT_PUBLIC_SITE_URL="http://localhost:3009"
    export NEXT_PUBLIC_ENVIRONMENT="development"
    export NODE_ENV="production"
fi

# Override some values for local development
export NEXT_PUBLIC_SITE_URL="http://localhost:3009"
export NEXT_PUBLIC_ENVIRONMENT="development"

echo "🔧 Using configuration:"
echo "   DATABASE_URL: ${DATABASE_URL}"
echo "   STORAGE_ENDPOINT: ${STORAGE_ENDPOINT}"
echo "   NEXT_PUBLIC_SITE_URL: ${NEXT_PUBLIC_SITE_URL}"
echo "   NEXT_PUBLIC_ENVIRONMENT: ${NEXT_PUBLIC_ENVIRONMENT}"

# Build Docker image with optimized Dockerfile
echo "🏗️  Building with optimized Dockerfile..."
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
    --file Dockerfile.optimized \
    .

if [ $? -eq 0 ]; then
    echo "✅ Optimized Docker image built successfully: ${FULL_IMAGE_NAME}"
    
    # Show image size comparison
    echo ""
    echo "📊 Image Size Analysis:"
    docker images | grep -E "(REPOSITORY|${IMAGE_NAME})" | head -5
    
    echo ""
    echo "🚀 Ready to use with docker-compose:"
    echo "   docker-compose up -d"
    echo ""
    echo "💡 Optimizations applied:"
    echo "   ✓ Multi-stage build with standalone output"
    echo "   ✓ Minimal runtime dependencies"
    echo "   ✓ Aggressive cache cleaning"
    echo "   ✓ Reduced memory allocation"
    echo "   ✓ Removed unnecessary files"
    echo ""
    echo "📈 Expected size reduction: ~70% (from 1.68GB to ~500MB)"
else
    echo "❌ Failed to build optimized Docker image"
    exit 1
fi