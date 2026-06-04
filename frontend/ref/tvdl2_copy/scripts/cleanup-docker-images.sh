#!/bin/bash

# Docker Image Cleanup Script
# This script removes dangling images, unused containers, and optionally old images

set -e

echo "🧹 Docker Image Cleanup Script"
echo "================================"

# Function to show current disk usage
show_disk_usage() {
    echo "📊 Current Docker disk usage:"
    docker system df
    echo ""
}

# Function to cleanup dangling images
cleanup_dangling_images() {
    echo "🗑️  Removing dangling images..."
    DANGLING_IMAGES=$(docker images -f "dangling=true" -q)
    if [ ! -z "$DANGLING_IMAGES" ]; then
        echo "Found $(echo $DANGLING_IMAGES | wc -w) dangling images"
        docker rmi $DANGLING_IMAGES
        echo "✅ Removed dangling images"
    else
        echo "✅ No dangling images found"
    fi
    echo ""
}

# Function to cleanup unused containers
cleanup_containers() {
    echo "🗑️  Removing stopped containers..."
    STOPPED_CONTAINERS=$(docker ps -a -q -f status=exited)
    if [ ! -z "$STOPPED_CONTAINERS" ]; then
        echo "Found $(echo $STOPPED_CONTAINERS | wc -w) stopped containers"
        docker rm $STOPPED_CONTAINERS
        echo "✅ Removed stopped containers"
    else
        echo "✅ No stopped containers found"
    fi
    echo ""
}

# Function to cleanup unused networks
cleanup_networks() {
    echo "🗑️  Removing unused networks..."
    docker network prune -f
    echo "✅ Removed unused networks"
    echo ""
}

# Function to cleanup unused volumes
cleanup_volumes() {
    echo "🗑️  Removing unused volumes..."
    docker volume prune -f
    echo "✅ Removed unused volumes"
    echo ""
}

# Function to show images by size
show_images_by_size() {
    echo "📊 Current images sorted by size:"
    docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}" | head -20
    echo ""
}

# Main cleanup
echo "Starting cleanup process..."
echo ""

# Show initial state
show_disk_usage

# Perform cleanup
cleanup_dangling_images
cleanup_containers
cleanup_networks
cleanup_volumes

# Show final state
echo "🎉 Cleanup completed!"
show_disk_usage
show_images_by_size

# Optional: Ask if user wants to remove old images
echo "💡 Optional: Remove old images (keeping latest 3 of each repository)"
read -p "Do you want to remove old images? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Removing old images..."
    
    # Get all repositories
    REPOS=$(docker images --format "{{.Repository}}" | grep -v "<none>" | sort | uniq)
    
    for repo in $REPOS; do
        if [ "$repo" != "<none>" ]; then
            echo "Processing repository: $repo"
            # Keep latest 3 images, remove older ones
            OLD_IMAGES=$(docker images "$repo" --format "{{.ID}}" | tail -n +4)
            if [ ! -z "$OLD_IMAGES" ]; then
                echo "  Removing $(echo $OLD_IMAGES | wc -w) old images from $repo"
                docker rmi $OLD_IMAGES 2>/dev/null || true
            fi
        fi
    done
    
    echo "✅ Old images cleanup completed"
    echo ""
    show_disk_usage
fi

echo "🎯 Cleanup script finished!"
echo ""
echo "💡 To prevent future buildup:"
echo "   • Use 'docker system prune' regularly"
echo "   • Add '--rm' flag to docker build commands"
echo "   • Remove unused images after testing"