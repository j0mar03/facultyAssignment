# Database Migration Guide - Transfer Data Between Laptops

This guide shows you how to transfer your existing database data from Docker on Windows to another laptop.

## Method 1: Database Dump (Recommended) ✅

This is the easiest and most reliable method. It creates a SQL file with all your data.

### On Windows Laptop (Source)

**Easy Way (Using Script):**
1. Double-click `backup-database.bat` in the project root
2. The script will automatically create a timestamped backup in `database-backup/` folder
3. Transfer the backup file to your new laptop

**Manual Way:**
1. **Make sure your Docker container is running:**
   ```bash
   docker ps
   ```

2. **Create a backup directory (optional but recommended):**
   ```bash
   mkdir database-backup
   ```

3. **Export the database to a SQL file:**
   ```bash
   # Using Docker exec to dump the database
   docker exec faculty_load_postgres pg_dump -U postgres -d faculty_load_db > database-backup/faculty_load_backup.sql
   
   # Or with formatting (easier to read):
   docker exec faculty_load_postgres pg_dump -U postgres -d faculty_load_db --clean --if-exists --format=plain > database-backup/faculty_load_backup.sql
   ```

4. **Verify the backup file was created:**
   ```bash
   # Check file size (should be > 0)
   dir database-backup\faculty_load_backup.sql
   
   # Or check first few lines
   type database-backup\faculty_load_backup.sql | more
   ```

5. **Transfer the backup file to your new laptop:**
   - **Option A: USB Drive** - Copy `database-backup/faculty_load_backup.sql` to USB
   - **Option B: Cloud Storage** - Upload to Google Drive, Dropbox, OneDrive, etc.
   - **Option C: Email** - Send to yourself (if file is small)
   - **Option D: GitHub** - Add to a private repository (if you want version control)
   - **Option E: Network Transfer** - Use SCP, FTP, or shared folder

### On New Laptop (Destination)

1. **Clone or copy your project:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/faculty-load-management.git
   cd faculty-load-management
   ```

2. **Copy the backup file to your project:**
   ```bash
   # If using USB or direct copy
   cp /path/to/faculty_load_backup.sql database-backup/
   
   # Or if you downloaded from cloud storage
   # Place it in the database-backup/ directory
   ```

3. **Set up Docker (if not already done):**
   ```bash
   # Make sure Docker is installed and running
   docker --version
   docker-compose --version
   ```

4. **Start the database container (empty database):**
   ```bash
   docker-compose up -d
   
   # Wait a few seconds for database to initialize
   sleep 5
   ```

5. **Restore the database:**
   
   **Easy Way (Windows - Using Script):**
   - Double-click `restore-database.bat` and follow the prompts
   - Or drag and drop the backup file onto `restore-database.bat`
   
   **Manual Way:**
   ```bash
   # Restore from backup
   docker exec -i faculty_load_postgres psql -U postgres -d faculty_load_db < database-backup/faculty_load_backup.sql
   
   # Or if the file is in a different location:
   docker exec -i faculty_load_postgres psql -U postgres -d faculty_load_db < /path/to/faculty_load_backup.sql
   ```

6. **Verify the data was restored:**
   ```bash
   # Connect to database and check tables
   docker exec -it faculty_load_postgres psql -U postgres -d faculty_load_db
   
   # Inside psql, run:
   \dt                    # List all tables
   SELECT COUNT(*) FROM faculty;    # Check faculty count
   SELECT COUNT(*) FROM courses;    # Check courses count
   SELECT COUNT(*) FROM assignments; # Check assignments count
   \q                    # Exit psql
   ```

7. **Test your application:**
   ```bash
   npm run dev
   ```

## Method 2: Docker Volume Export (Advanced)

This method exports the entire Docker volume, preserving the exact database state.

### On Windows Laptop (Source)

1. **Stop the container:**
   ```bash
   docker-compose down
   ```

2. **Find the volume name:**
   ```bash
   docker volume ls
   # Look for something like: faculty-load-management_postgres_data
   ```

3. **Export the volume:**
   ```bash
   # Create a backup directory
   mkdir database-backup
   
   # Export the volume to a tar file
   docker run --rm -v faculty-load-management_postgres_data:/data -v ${PWD}/database-backup:/backup alpine tar czf /backup/postgres_volume_backup.tar.gz -C /data .
   ```

4. **Transfer the tar file to your new laptop** (same methods as Method 1)

### On New Laptop (Destination)

1. **Set up the project and start Docker:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/faculty-load-management.git
   cd faculty-load-management
   docker-compose up -d
   ```

2. **Stop the container:**
   ```bash
   docker-compose down
   ```

3. **Import the volume:**
   ```bash
   # Find the volume name on new laptop
   docker volume ls
   
   # Import the volume
   docker run --rm -v faculty-load-management_postgres_data:/data -v ${PWD}/database-backup:/backup alpine sh -c "cd /data && tar xzf /backup/postgres_volume_backup.tar.gz"
   ```

4. **Start the container:**
   ```bash
   docker-compose up -d
   ```

## Quick Reference Commands

### Backup (Windows)
```bash
# Simple backup
docker exec faculty_load_postgres pg_dump -U postgres -d faculty_load_db > backup.sql

# Backup with schema and data (recommended)
docker exec faculty_load_postgres pg_dump -U postgres -d faculty_load_db --clean --if-exists > backup.sql

# Backup specific tables only
docker exec faculty_load_postgres pg_dump -U postgres -d faculty_load_db -t faculty -t courses > backup.sql
```

### Restore (New Laptop)
```bash
# Restore from backup
docker exec -i faculty_load_postgres psql -U postgres -d faculty_load_db < backup.sql

# Restore and ignore errors (if tables already exist)
docker exec -i faculty_load_postgres psql -U postgres -d faculty_load_db -f - < backup.sql
```

## Troubleshooting

### Issue: "database does not exist"
**Solution:**
```bash
# Create database first
docker exec -it faculty_load_postgres psql -U postgres
CREATE DATABASE faculty_load_db;
\q

# Then restore
docker exec -i faculty_load_postgres psql -U postgres -d faculty_load_db < backup.sql
```

### Issue: "permission denied" on backup file
**Solution (Windows):**
```bash
# Use full path or PowerShell
docker exec faculty_load_postgres pg_dump -U postgres -d faculty_load_db > C:\Users\YourName\backup.sql
```

### Issue: "connection refused" when restoring
**Solution:**
```bash
# Make sure container is running
docker ps

# Wait a few seconds after starting
docker-compose up -d
sleep 5
docker exec -i faculty_load_postgres psql -U postgres -d faculty_load_db < backup.sql
```

### Issue: Backup file is empty or corrupted
**Solution:**
```bash
# Check container logs
docker logs faculty_load_postgres

# Try dumping again with verbose output
docker exec faculty_load_postgres pg_dump -U postgres -d faculty_load_db -v > backup.sql
```

## Automated Backup Script

Create a `backup-database.sh` (Linux/Mac) or `backup-database.bat` (Windows) for easy backups:

### Windows (backup-database.bat)
```batch
@echo off
echo Creating database backup...
docker exec faculty_load_postgres pg_dump -U postgres -d faculty_load_db --clean --if-exists > database-backup\backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%.sql
echo Backup completed!
pause
```

### Linux/Mac (backup-database.sh)
```bash
#!/bin/bash
BACKUP_DIR="database-backup"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

mkdir -p $BACKUP_DIR
echo "Creating database backup..."
docker exec faculty_load_postgres pg_dump -U postgres -d faculty_load_db --clean --if-exists > $BACKUP_FILE
echo "Backup completed: $BACKUP_FILE"
```

## Best Practices

1. **Regular Backups**: Create backups regularly, especially before major changes
2. **Test Restores**: Periodically test restoring from backups to ensure they work
3. **Version Control**: Keep backup files organized with timestamps
4. **Multiple Copies**: Store backups in multiple locations (local + cloud)
5. **Documentation**: Keep notes about what data is in each backup

## Alternative: Use Cloud Database

For easier data synchronization between laptops, consider using a cloud database:

- **Heroku Postgres** (free tier available)
- **Supabase** (free tier available)
- **AWS RDS** (pay-as-you-go)
- **Google Cloud SQL**

This way, both laptops connect to the same database, and you don't need to transfer files.

## Summary

**Recommended Workflow:**
1. On Windows: `docker exec faculty_load_postgres pg_dump -U postgres -d faculty_load_db > backup.sql`
2. Transfer `backup.sql` to new laptop (USB/Cloud/Email)
3. On new laptop: `docker-compose up -d` then `docker exec -i faculty_load_postgres psql -U postgres -d faculty_load_db < backup.sql`
4. Done! Your data is now on the new laptop.

