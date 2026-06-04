#!/bin/bash

# Build Highly Optimized Docker image - Target: <400MB
# Usage: ./build-docker-optimized-v2.sh [IMAGE_TAG] [IMAGE_NAME]
# Example: ./build-docker-optimized-v2.sh 1.0-opt test-opt

set -e

IMAGE_TAG=${1:-"1.0-opt"}
IMAGE_NAME=${2:-"test-opt"}
FULL_IMAGE_NAME="${IMAGE_NAME}:${IMAGE_TAG}"

echo "🚀 Building HIGHLY OPTIMIZED Docker image"
echo "📦 Image Name: ${IMAGE_NAME}" 
echo "🏷️  Image Tag: ${IMAGE_TAG}"
echo "📦 Full Image: ${FULL_IMAGE_NAME}"
echo "🎯 Target: <400MB (52% reduction from 834MB)"

# Function to cleanup dangling images
cleanup_dangling_images() {
    echo "🧹 Cleaning up dangling images..."
    DANGLING_IMAGES=$(docker images -f "dangling=true" -q)
    if [ ! -z "$DANGLING_IMAGES" ]; then
        docker rmi $DANGLING_IMAGES 2>/dev/null || true
        echo "✅ Removed dangling images"
    else
        echo "✅ No dangling images to remove"
    fi
}

# Cleanup before build
echo "🧹 Pre-build cleanup..."
cleanup_dangling_images

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
    export RECAPTCHA_SECRET_KEY="6LcsyJ0rAAAAAMBAUph-fUd94LSllOXOwYF98esr"
    export NEXT_PUBLIC_RECAPTCHA_SITE_KEY="6LcsyJ0rAAAAAGM6WEkbd6acAOpyr1YI3LUxt15O"
fi

# Override for local development
export NEXT_PUBLIC_SITE_URL="https://thuvienduonglieu.com"
export NEXT_PUBLIC_ENVIRONMENT="production"
export NEXTAUTH_URL="${NEXT_PUBLIC_SITE_URL}"
export NEXTAUTH_SECRET="your-secret-key-here"

echo "🔧 Configuration:"
echo "   DATABASE_URL: ${DATABASE_URL}"
echo "   STORAGE_ENDPOINT: ${STORAGE_ENDPOINT}"
echo "   SITE_URL: ${NEXT_PUBLIC_SITE_URL}"
echo "   NEXTAUTH_URL: ${NEXTAUTH_URL}"

# Build with optimized Dockerfile v2
echo "🏗️  Building with highly optimized Dockerfile v2..."
docker build \
    --build-arg DATABASE_URL="${DATABASE_URL}" \
    --build-arg STORAGE_ENDPOINT="${STORAGE_ENDPOINT}" \
    --build-arg STORAGE_ACCESS_KEY="${STORAGE_ACCESS_KEY}" \
    --build-arg STORAGE_SECRET_KEY="${STORAGE_SECRET_KEY}" \
    --build-arg STORAGE_BUCKET="${STORAGE_BUCKET}" \
    --build-arg NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL}" \
    --build-arg NEXT_PUBLIC_ENVIRONMENT="${NEXT_PUBLIC_ENVIRONMENT}" \
    --build-arg NEXT_PUBLIC_RECAPTCHA_SITE_KEY="${NEXT_PUBLIC_RECAPTCHA_SITE_KEY}" \
    --build-arg RECAPTCHA_SECRET_KEY="${RECAPTCHA_SECRET_KEY}" \
    --build-arg NEXTAUTH_URL="${NEXTAUTH_URL}" \
    --build-arg NEXTAUTH_SECRET="${NEXTAUTH_SECRET}" \
    --build-arg NODE_ENV="${NODE_ENV}" \
    --tag "${FULL_IMAGE_NAME}" \
    --file Dockerfile.optimized-v2 \
    --rm \
    .

if [ $? -eq 0 ]; then
    echo "✅ Highly optimized Docker image built successfully!"
    
    # Post-build cleanup
    echo "🧹 Post-build cleanup..."
    cleanup_dangling_images
    
    # Show size comparison
    echo ""
    echo "📊 Image Size Comparison:"
    echo "Original image:"
    docker images test:1.0 --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}" 2>/dev/null || echo "Original image not found"
    echo ""
    echo "Optimized image:"
    docker images "${FULL_IMAGE_NAME}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
    
    # Calculate size reduction
    OLD_SIZE_MB=$(docker images test:1.0 --format "{{.Size}}" 2>/dev/null | sed 's/MB//' || echo "834")
    NEW_SIZE=$(docker images "${FULL_IMAGE_NAME}" --format "{{.Size}}")
    NEW_SIZE_MB=$(echo $NEW_SIZE | sed 's/MB//')
    
    if [[ "$NEW_SIZE_MB" =~ ^[0-9]+$ ]] && [[ "$OLD_SIZE_MB" =~ ^[0-9]+$ ]]; then
        REDUCTION=$(echo "scale=1; (($OLD_SIZE_MB - $NEW_SIZE_MB) / $OLD_SIZE_MB) * 100" | bc -l 2>/dev/null || echo "N/A")
        echo ""
        echo "📈 Optimization Results:"
        echo "   Original size: ${OLD_SIZE_MB}MB"
        echo "   Optimized size: ${NEW_SIZE}"
        echo "   Size reduction: ${REDUCTION}%"
    fi
    
    echo ""
    echo "🚀 Ready to use:"
    echo "   docker run -p 3009:3000 ${FULL_IMAGE_NAME} "
    
    echo ""
    echo "💡 Key optimizations applied:"
    echo "   ✓ Minimal production dependencies only"
    echo "   ✓ Removed extraneous packages"
    echo "   ✓ Multi-stage build with cleanup"
    echo "   ✓ Standalone Next.js output"
    echo "   ✓ Cache cleanup at each stage"
    echo "   ✓ Minimal Alpine base image"
    echo "   ✓ dumb-init for signal handling"
    echo "   ✓ Non-root user security"
    
    # Quick test
    echo ""
    echo "🧪 Quick test..."
    docker run --rm -d --name test-opt-container -p 3011:3000 "${FULL_IMAGE_NAME}" || true
    sleep 3
    
    if curl -f http://localhost:3011 >/dev/null 2>&1; then
        echo "✅ Quick test passed - application is running!"
        docker stop test-opt-container >/dev/null 2>&1 || true
    else
        echo "⚠️  Quick test failed - please check manually"
        docker stop test-opt-container >/dev/null 2>&1 || true
    fi
    
else
    echo "❌ Failed to build highly optimized image"
    echo "🧹 Cleanup after failed build..."
    cleanup_dangling_images
    exit 1
fi