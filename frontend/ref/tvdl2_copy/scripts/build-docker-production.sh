#!/bin/bash

# Build Docker image for Production Environment
# Usage: ./build-docker-production.sh [IMAGE_TAG] [IMAGE_NAME]
# Example: ./build-docker-production.sh v1.0.0 registry.thuvienduonglieu.site/thuvienduonglieu-app

set -e

IMAGE_TAG=${1:-"latest"}
IMAGE_NAME=${2:-"registry.thuvienduonglieu.site/thuvienduonglieu-app"}
FULL_IMAGE_NAME="${IMAGE_NAME}:${IMAGE_TAG}"

echo "🏗️  Building Docker image for Production"
echo "📦 Image Name: ${IMAGE_NAME}" 
echo "🏷️  Image Tag: ${IMAGE_TAG}"
echo "📦 Full Image: ${FULL_IMAGE_NAME}"
echo "🌐 Environment: Production"
echo "🔗 Site URL: https://thuvienduonglieu.com"

# Load environment variables from .env.production
if [ -f .env.production ]; then
    source .env.production
    echo "✅ Loaded .env.production"
else
    echo "❌ .env.production file not found"
    exit 1
fi

# Build Docker image with optimized Dockerfile
echo "🎯 Using optimized Dockerfile for production (reduces size by ~70%)"
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
    echo "✅ Docker image built successfully: ${FULL_IMAGE_NAME}"
    echo "📤 Pushing image to registry..."
    
    # Push to registry
    docker push "${FULL_IMAGE_NAME}"
    
    if [ $? -eq 0 ]; then
        echo "✅ Image pushed to registry successfully!"
        echo "🚀 Ready to deploy to production with:"
        echo "   cd helm && ./deploy-production.sh ${IMAGE_TAG}"
    else
        echo "❌ Failed to push image to registry"
        exit 1
    fi
else
    echo "❌ Failed to build Docker image"
    exit 1
fi

echo "📊 Image Details:"
echo "   Registry: ${IMAGE_NAME}"
echo "   Tag: ${IMAGE_TAG}"
echo "   Full Image: ${FULL_IMAGE_NAME}"
echo "   Environment: Production"
echo "   Site URL: https://thuvienduonglieu.com"