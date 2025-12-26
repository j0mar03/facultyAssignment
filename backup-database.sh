#!/bin/bash
# Database Backup Script for Linux/WSL
# This script creates a backup of your PostgreSQL database running in Docker

echo "========================================"
echo "Faculty Load Management - Database Backup"
echo "========================================"
echo ""

# Create backup directory if it doesn't exist
mkdir -p database-backup

# Generate timestamp for backup filename
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="database-backup/faculty_load_backup_${TIMESTAMP}.sql"

echo "Checking if Docker container is running..."
if ! docker ps | grep -q "faculty_load_postgres"; then
    echo "ERROR: Docker container 'faculty_load_postgres' is not running!"
    echo "Please start it with: docker-compose up -d"
    exit 1
fi

echo ""
echo "Creating database backup..."
echo "Backup file: $BACKUP_FILE"
echo ""

# Create the backup
docker exec faculty_load_postgres pg_dump -U postgres -d faculty_load_db --clean --if-exists > "$BACKUP_FILE"

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Backup failed!"
    exit 1
fi

# Check if file was created and has content
if [ ! -f "$BACKUP_FILE" ]; then
    echo ""
    echo "ERROR: Backup file was not created!"
    exit 1
fi

if [ ! -s "$BACKUP_FILE" ]; then
    echo ""
    echo "WARNING: Backup file is empty!"
    exit 1
fi

# Get file size for display
FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

echo ""
echo "========================================"
echo "Backup completed successfully!"
echo "========================================"
echo ""
echo "Backup location: $BACKUP_FILE"
echo "File size: $FILE_SIZE"
echo ""
echo "You can now transfer this file to another laptop."
echo "See DATABASE_MIGRATION.md for restore instructions."
echo ""

