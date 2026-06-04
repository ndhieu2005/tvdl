#!/bin/bash

# Universal Optimized Docker Build Script
# Usage: ./build-optimized.sh [environment] [tag] [name]
# Examples:
#   ./build-optimized.sh dev 1.0-optimized test
#   ./build-optimized.sh prod v1.0.0 registry.thuvienduonglieu.site/thuvienduonglieu-app

set -e

ENVIRONMENT=${1:-"dev"}
IMAGE_TAG=${2:-"1.0-optimized"}
IMAGE_NAME=${3:-"test"}

echo "🚀 Universal Optimized Docker Build"
echo "=================================="
echo "🌐 Environment: ${ENVIRONMENT}"
echo "📦 Image: ${IMAGE_NAME}:${IMAGE_TAG}"
echo ""

case $ENVIRONMENT in
    "dev"|"development"|"test")
        echo "🧪 Building for Development/Testing..."
        echo "📝 Using: build-docker-final.sh"
        echo "🎯 Expected size: ~680MB (60% reduction)"
        echo ""
        ./scripts/build-docker-final.sh "${IMAGE_TAG}" "${IMAGE_NAME}"
        ;;
    
    "prod"|"production")
        echo "🏢 Building for Production..."
        echo "📝 Using: build-docker-production-optimized.sh"
        echo "🎯 Expected size: ~680MB (60% reduction)"
        echo "📤 Will push to registry"
        echo ""
        ./scripts/build-docker-production-optimized.sh "${IMAGE_TAG}" "${IMAGE_NAME}"
        ;;
    
    *)
        echo "❌ Invalid environment: ${ENVIRONMENT}"
        echo ""
        echo "📋 Valid environments:"
        echo "   dev, development, test  - For development/testing"
        echo "   prod, production        - For production deployment"
        echo ""
        echo "📖 Usage examples:"
        echo "   ./build-optimized.sh dev 1.0-optimized test"
        echo "   ./build-optimized.sh prod v1.0.0 registry.thuvienduonglieu.site/thuvienduonglieu-app"
        exit 1
        ;;
esac

echo ""
echo "✅ Build completed successfully!"
echo ""
echo "📊 Summary:"
echo "   Environment: ${ENVIRONMENT}"
echo "   Image: ${IMAGE_NAME}:${IMAGE_TAG}"
echo "   Optimization: ~60% size reduction"
echo "   Dockerfile: Dockerfile.final"