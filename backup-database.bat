@echo off
REM Database Backup Script for Windows
REM This script creates a backup of your PostgreSQL database running in Docker

echo ========================================
echo Faculty Load Management - Database Backup
echo ========================================
echo.

REM Create backup directory if it doesn't exist
if not exist "database-backup" mkdir database-backup

REM Generate timestamp for backup filename
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set timestamp=%datetime:~0,8%_%datetime:~8,6%

REM Backup filename with timestamp
set BACKUP_FILE=database-backup\faculty_load_backup_%timestamp%.sql

echo Checking if Docker container is running...
docker ps | findstr "faculty_load_postgres" >nul
if errorlevel 1 (
    echo ERROR: Docker container 'faculty_load_postgres' is not running!
    echo Please start it with: docker-compose up -d
    pause
    exit /b 1
)

echo.
echo Creating database backup...
echo Backup file: %BACKUP_FILE%
echo.

REM Create the backup
docker exec faculty_load_postgres pg_dump -U postgres -d faculty_load_db --clean --if-exists > %BACKUP_FILE%

if errorlevel 1 (
    echo.
    echo ERROR: Backup failed!
    pause
    exit /b 1
)

REM Check if file was created and has content
if not exist "%BACKUP_FILE%" (
    echo.
    echo ERROR: Backup file was not created!
    pause
    exit /b 1
)

for %%A in ("%BACKUP_FILE%") do set size=%%~zA
if %size% EQU 0 (
    echo.
    echo WARNING: Backup file is empty!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Backup completed successfully!
echo ========================================
echo.
echo Backup location: %BACKUP_FILE%
echo.
echo You can now transfer this file to another laptop.
echo See DATABASE_MIGRATION.md for restore instructions.
echo.
pause

