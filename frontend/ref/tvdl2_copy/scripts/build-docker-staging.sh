#!/bin/bash

# Build Docker image for Staging Environment
# Usage: ./build-docker-staging.sh [IMAGE_TAG] [IMAGE_NAME]
# Example: ./build-docker-staging.sh stg-v1.0.0 registry.viralpeek.site/viralpeek-app

set -e

IMAGE_TAG=${1:-"stg-latest"}
IMAGE_NAME=${2:-"registry.viralpeek.site/viralpeek-app"}
FULL_IMAGE_NAME="${IMAGE_NAME}:${IMAGE_TAG}"

echo "🏗️  Building Docker image for Staging"
echo "📦 Image Name: ${IMAGE_NAME}"
echo "🏷️  Image Tag: ${IMAGE_TAG}"
echo "📦 Full Image: ${FULL_IMAGE_NAME}"
echo "🌐 Environment: Staging"
echo "🔗 Site URL: https://stg.trendiefox.com"

# Load environment variables from .env.staging
if [ -f .env.staging ]; then
    source .env.staging
    echo "✅ Loaded .env.staging"
else
    echo "❌ .env.staging file not found"
    exit 1
fi

# Build Docker image with build arguments
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
    --file Dockerfile \
    .

if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully: ${FULL_IMAGE_NAME}"
    echo "📤 Pushing image to registry..."
    
    # Push to registry
    docker push "${FULL_IMAGE_NAME}"
    
    if [ $? -eq 0 ]; then
        echo "✅ Image pushed to registry successfully!"
        echo "🚀 Ready to deploy to staging with:"
        echo "   cd helm && ./deploy-staging.sh ${IMAGE_TAG}"
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
echo "   Environment: Staging"
echo "   Site URL: https://stg.trendiefox.com"