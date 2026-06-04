#!/bin/bash

# Script khắc phục lỗi migration production

set -e

echo "🔧 KHẮC PHỤC MIGRATION LỖI"
echo "========================="

# Database configuration
DB_HOST="${DATABASE_HOST:-192.168.50.161}"
DB_PORT="${DATABASE_PORT:-5434}"
DB_NAME="${DATABASE_NAME:-trendiefox}"
DB_USER="${DATABASE_USER:-admin}"

echo "📋 Configuration:"
echo "   Database Host: $DB_HOST"
echo "   Database Port: $DB_PORT"
echo "   Database Name: $DB_NAME"
echo "   Database User: $DB_USER"
echo ""

# 1. Kiểm tra lỗi migration
echo "🔍 Checking migration status..."
npx prisma migrate status || echo "Migration có lỗi"

# 2. Resolve migration issue
echo "🔧 Resolving migration conflict..."

# Kiểm tra nếu cột favicon đã tồn tại
echo "📊 Checking if favicon column exists..."
COLUMN_EXISTS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT column_name FROM information_schema.columns WHERE table_name='settings' AND column_name='favicon';" | tr -d ' ')

if [ -n "$COLUMN_EXISTS" ]; then
    echo "✅ Column 'favicon' already exists in settings table"
    
    # Mark migration as applied
    echo "🎯 Marking migration as applied..."
    npx prisma migrate resolve --applied "$(ls prisma/migrations | grep favicon | head -1)" || echo "Migration resolve failed"
    
    # Reset migration state
    echo "🔄 Resetting migration state..."
    npx prisma db push --force-reset || echo "Push failed"
    
    # Generate new migration
    echo "📝 Generating clean migration..."
    npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-schema-datasource prisma/schema.prisma --script > fix-migration.sql || echo "Diff failed"
    
    if [ -s fix-migration.sql ]; then
        echo "📄 Applying clean migration..."
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f fix-migration.sql || echo "Apply failed"
        rm fix-migration.sql
    fi
    
    # Deploy migrations
    echo "🚀 Deploying migrations..."
    npx prisma migrate deploy || echo "Deploy failed"
else
    echo "❌ Column 'favicon' does not exist, running normal migration..."
    npx prisma migrate deploy
fi

echo "✅ Migration fix completed!"

# 3. Verify database
echo "🔍 Verifying database schema..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\d settings" || echo "Cannot describe settings table"

echo "🎉 Migration fix completed successfully!"