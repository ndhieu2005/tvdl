#!/bin/bash

# Build Docker image for ViralPeek
# Usage: ./build-docker.sh [TAG] [ENVIRONMENT]

set -e

IMAGE_NAME="viralpeek-app"
REGISTRY="registry.viralpeek.site"
TAG=${1:-"latest"}
ENVIRONMENT=${2:-"production"}

echo "🏗️  Building Docker image for ViralPeek"
echo "📦 Image: $REGISTRY/$IMAGE_NAME:$TAG"
echo "🏷️  Environment: $ENVIRONMENT"

# Build image
docker build \
  --platform linux/amd64 \
  --build-arg NODE_ENV=$ENVIRONMENT \
  --tag $REGISTRY/$IMAGE_NAME:$TAG \
  --tag $REGISTRY/$IMAGE_NAME:latest \
  .

echo "✅ Docker image built successfully!"

# Push image if registry is configured
if docker info | grep -q "Registry:"; then
  echo "📤 Pushing image to registry..."
  docker push $REGISTRY/$IMAGE_NAME:$TAG
  
  if [ "$TAG" != "latest" ]; then
    docker push $REGISTRY/$IMAGE_NAME:latest
  fi
  
  echo "✅ Image pushed successfully!"
else
  echo "⚠️  Registry not configured, skipping push"
fi

echo "🐳 Image ready: $REGISTRY/$IMAGE_NAME:$TAG"