#!/bin/bash
# Database Restore Script for Linux/WSL
# This script restores a PostgreSQL database backup from a SQL file

echo "========================================"
echo "Faculty Load Management - Database Restore"
echo "========================================"
echo ""

# Check if backup file is provided as argument
if [ -z "$1" ]; then
    echo "Usage: ./restore-database.sh [backup-file.sql]"
    echo ""
    echo "Example: ./restore-database.sh database-backup/faculty_load_backup.sql"
    echo ""
    echo "Or select from available backups:"
    if [ -d "database-backup" ]; then
        echo ""
        echo "Available backups:"
        ls -lh database-backup/*.sql 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'
    fi
    exit 1
fi

BACKUP_FILE="$1"

# Check if file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "ERROR: Backup file not found: $BACKUP_FILE"
    echo ""
    exit 1
fi

echo "Checking if Docker container is running..."
if ! docker ps | grep -q "faculty_load_postgres"; then
    echo "ERROR: Docker container 'faculty_load_postgres' is not running!"
    echo "Please start it with: docker-compose up -d"
    echo ""
    exit 1
fi

echo ""
echo "WARNING: This will overwrite existing data in the database!"
echo "Backup file: $BACKUP_FILE"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

echo ""
echo "Restoring database..."
echo ""

# Restore the backup
docker exec -i faculty_load_postgres psql -U postgres -d faculty_load_db < "$BACKUP_FILE"

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Restore failed!"
    echo "Check the error messages above."
    echo ""
    exit 1
fi

echo ""
echo "========================================"
echo "Database restored successfully!"
echo "========================================"
echo ""
echo "You can now start your application with: npm run dev"
echo ""

