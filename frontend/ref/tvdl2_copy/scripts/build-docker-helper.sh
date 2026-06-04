#!/bin/bash

# Helper script for building Docker images
# Usage: ./build-docker-helper.sh [ENVIRONMENT] [IMAGE_TAG] [IMAGE_NAME]
# Example: ./build-docker-helper.sh staging stg-v1.0.0 registry.viralpeek.site/viralpeek-app

set -e

ENVIRONMENT=${1:-"staging"}
IMAGE_TAG=${2:-"latest"}
IMAGE_NAME=${3:-"registry.viralpeek.site/viralpeek-app"}

echo "🚀 Docker Build Helper"
echo "🌐 Environment: ${ENVIRONMENT}"
echo "📦 Image Name: ${IMAGE_NAME}"
echo "🏷️  Image Tag: ${IMAGE_TAG}"
echo ""

case ${ENVIRONMENT} in
    "staging"|"stg")
        echo "🔧 Building for Staging Environment..."
        ./scripts/build-docker-staging.sh "${IMAGE_TAG}" "${IMAGE_NAME}"
        ;;
    "production"|"prod")
        echo "🔧 Building for Production Environment..."
        ./scripts/build-docker-production.sh "${IMAGE_TAG}" "${IMAGE_NAME}"
        ;;
    *)
        echo "❌ Unknown environment: ${ENVIRONMENT}"
        echo "💡 Supported environments: staging, stg, production, prod"
        echo ""
        echo "Usage examples:"
        echo "  ./build-docker-helper.sh staging stg-v1.0.0"
        echo "  ./build-docker-helper.sh production v1.0.0"
        echo "  ./build-docker-helper.sh stg latest custom-registry/my-app"
        exit 1
        ;;
esac

echo ""
echo "✅ Docker build completed for ${ENVIRONMENT} environment!"