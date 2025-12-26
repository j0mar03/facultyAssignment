@echo off
REM Database Restore Script for Windows
REM This script restores a PostgreSQL database backup from a SQL file

echo ========================================
echo Faculty Load Management - Database Restore
echo ========================================
echo.

REM Check if backup file is provided as argument
if "%~1"=="" (
    echo Usage: restore-database.bat [backup-file.sql]
    echo.
    echo Example: restore-database.bat database-backup\faculty_load_backup.sql
    echo.
    echo Or drag and drop a .sql file onto this script.
    echo.
    pause
    exit /b 1
)

set BACKUP_FILE=%~1

REM Check if file exists
if not exist "%BACKUP_FILE%" (
    echo ERROR: Backup file not found: %BACKUP_FILE%
    echo.
    pause
    exit /b 1
)

echo Checking if Docker container is running...
docker ps | findstr "faculty_load_postgres" >nul
if errorlevel 1 (
    echo ERROR: Docker container 'faculty_load_postgres' is not running!
    echo Please start it with: docker-compose up -d
    echo.
    pause
    exit /b 1
)

echo.
echo WARNING: This will overwrite existing data in the database!
echo Backup file: %BACKUP_FILE%
echo.
set /p confirm="Are you sure you want to continue? (yes/no): "
if /i not "%confirm%"=="yes" (
    echo Restore cancelled.
    pause
    exit /b 0
)

echo.
echo Restoring database...
echo.

REM Restore the backup
docker exec -i faculty_load_postgres psql -U postgres -d faculty_load_db < "%BACKUP_FILE%"

if errorlevel 1 (
    echo.
    echo ERROR: Restore failed!
    echo Check the error messages above.
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Database restored successfully!
echo ========================================
echo.
echo You can now start your application with: npm run dev
echo.
pause

