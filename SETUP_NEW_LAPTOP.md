# Step-by-Step Guide: Setting Up Project on New Laptop

This guide will walk you through setting up the Faculty Load Management System on a new laptop, including restoring your existing database data.

## Prerequisites Checklist

Before starting, make sure you have:
- [ ] Your database backup file (`.sql` file from the old laptop)
- [ ] Access to your GitHub repository (or project files)
- [ ] Internet connection

---

## Step 1: Install Required Software

### 1.1 Install Node.js

**For Windows:**
1. Go to https://nodejs.org/
2. Download the LTS version (v18 or higher)
3. Run the installer and follow the prompts
4. Verify installation:
   ```bash
   node --version
   npm --version
   ```

**For Linux/WSL:**
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

**For macOS:**
```bash
# Using Homebrew
brew install node

# Verify installation
node --version
npm --version
```

### 1.2 Install Docker

**For Windows:**
1. Go to https://www.docker.com/products/docker-desktop/
2. Download Docker Desktop for Windows
3. Install and restart your computer
4. Launch Docker Desktop
5. Verify installation:
   ```bash
   docker --version
   docker-compose --version
   ```

**For Linux/WSL:**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group (to run without sudo)
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin

# Log out and log back in for group changes to take effect
# Verify installation
docker --version
docker compose version
```

**For macOS:**
1. Go to https://www.docker.com/products/docker-desktop/
2. Download Docker Desktop for Mac
3. Install and launch Docker Desktop
4. Verify installation:
   ```bash
   docker --version
   docker-compose --version
   ```

### 1.3 Install Git (if not already installed)

**For Windows:**
- Download from https://git-scm.com/download/win
- Install with default settings

**For Linux/WSL:**
```bash
sudo apt-get update
sudo apt-get install git
```

**For macOS:**
```bash
brew install git
```

**Verify installation:**
```bash
git --version
```

---

## Step 2: Get Your Project Files

### Option A: Clone from GitHub (Recommended)

1. **Open terminal/command prompt**

2. **Navigate to where you want the project:**
   ```bash
   cd ~/dev/projects  # or any directory you prefer
   ```

3. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/faculty-load-management.git
   cd faculty-load-management
   ```

   Replace `YOUR_USERNAME` with your actual GitHub username.

### Option B: Copy Project Files Manually

If you don't have GitHub set up:
1. Copy the entire project folder from your old laptop
2. Transfer via USB drive, cloud storage, or network
3. Place it in your desired location
4. Navigate to it:
   ```bash
   cd /path/to/faculty-load-management
   ```

---

## Step 3: Transfer Your Database Backup

### 3.1 Get Your Backup File

From your old laptop, you should have a backup file like:
- `faculty_load_backup_YYYYMMDD_HHMMSS.sql`
- Or `backup.sql`

### 3.2 Transfer Methods

**Option 1: USB Drive**
- Copy the backup file to a USB drive
- Plug USB into new laptop
- Copy file to project folder: `database-backup/` or project root

**Option 2: Cloud Storage**
- Upload backup file to Google Drive, Dropbox, OneDrive, etc.
- Download on new laptop
- Place in project folder: `database-backup/` or project root

**Option 3: Email**
- Email the backup file to yourself
- Download attachment on new laptop
- Place in project folder

**Option 4: Network Transfer**
- Use SCP, FTP, or shared folder
- Transfer to new laptop

### 3.3 Verify Backup File Location

```bash
# Navigate to project directory
cd ~/dev/projects/js-projects/faculty-load-management

# Create backup directory if it doesn't exist
mkdir -p database-backup

# Verify your backup file is there
ls -lh database-backup/*.sql
# or
ls database-backup/
```

---

## Step 4: Install Project Dependencies

### 4.1 Install Root Dependencies

```bash
# Make sure you're in the project root
cd ~/dev/projects/js-projects/faculty-load-management

# Install root dependencies
npm install
```

### 4.2 Install All Dependencies (Backend + Frontend)

```bash
# This installs dependencies for root, backend, and frontend
npm run install:all
```

**This may take a few minutes.** Wait for it to complete.

---

## Step 5: Set Up Environment Variables

### 5.1 Create Environment File

```bash
# Copy the example file
cp .env.example .env
```

### 5.2 Edit Environment File

Open `.env` in your text editor and update with your settings:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=faculty_load_db

# Server Configuration
PORT=5000
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development

# Frontend API URL
VITE_API_URL=http://localhost:5000/api
```

**Important:** 
- Change `JWT_SECRET` to a strong random string (at least 32 characters)
- Keep `DB_PASSWORD` as `postgres` if using Docker (matches docker-compose.yml)
- Or change it and update `docker-compose.yml` to match

---

## Step 6: Set Up Docker Database

### 6.1 Start Docker

**Windows:**
- Make sure Docker Desktop is running (check system tray)

**Linux/WSL:**
```bash
# Start Docker service
sudo service docker start

# Or if using systemd
sudo systemctl start docker
```

### 6.2 Start Database Container

```bash
# Make sure you're in the project root
cd ~/dev/projects/js-projects/faculty-load-management

# Start the database
docker-compose up -d
```

### 6.3 Verify Database is Running

```bash
# Check if container is running
docker ps

# You should see something like:
# CONTAINER ID   IMAGE         ...   NAMES
# abc123def456   postgres:15   ...   faculty_load_postgres
```

### 6.4 Wait for Database to Initialize

Wait about 10-15 seconds for PostgreSQL to fully start up.

```bash
# Check database logs to see when it's ready
docker logs faculty_load_postgres

# Look for: "database system is ready to accept connections"
```

---

## Step 7: Restore Your Database Backup

### 7.1 Make Restore Script Executable (WSL/Linux/Mac)

```bash
chmod +x restore-database.sh
```

### 7.2 Restore the Database

**Option A: Using the Script (Recommended)**

**For WSL/Linux/Mac:**
```bash
# Run restore script
./restore-database.sh database-backup/faculty_load_backup_YYYYMMDD_HHMMSS.sql

# Or if backup is in root directory
./restore-database.sh backup.sql

# Or run without arguments to see available backups
./restore-database.sh
```

**For Windows:**
- Double-click `restore-database.bat`
- Or run: `restore-database.bat database-backup\backup.sql`

**Option B: Manual Restore**

```bash
# Restore from backup file
docker exec -i faculty_load_postgres psql -U postgres -d faculty_load_db < database-backup/faculty_load_backup_YYYYMMDD_HHMMSS.sql

# Or if backup is in root
docker exec -i faculty_load_postgres psql -U postgres -d faculty_load_db < backup.sql
```

### 7.3 Verify Data Was Restored

```bash
# Connect to database
docker exec -it faculty_load_postgres psql -U postgres -d faculty_load_db

# Inside psql, check your data:
\dt                    # List all tables
SELECT COUNT(*) FROM faculty;      # Check faculty count
SELECT COUNT(*) FROM courses;      # Check courses count
SELECT COUNT(*) FROM assignments;  # Check assignments count
SELECT COUNT(*) FROM users;        # Check users count

# Exit psql
\q
```

You should see the same counts as your old laptop!

---

## Step 8: Start the Application

### 8.1 Start Development Servers

```bash
# Make sure you're in project root
cd ~/dev/projects/js-projects/faculty-load-management

# Start both backend and frontend
npm run dev
```

This will start:
- **Backend** on http://localhost:5000
- **Frontend** on http://localhost:3000 (or another port)

### 8.2 Or Start Separately

**Terminal 1 - Backend:**
```bash
npm run dev:backend
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
```

### 8.3 Access the Application

1. Open your web browser
2. Go to: http://localhost:3000 (or the port shown in terminal)
3. You should see the login page
4. Log in with your existing credentials

---

## Step 9: Verify Everything Works

### 9.1 Test Database Connection

```bash
# Check if you can query the database
docker exec -it faculty_load_postgres psql -U postgres -d faculty_load_db -c "SELECT COUNT(*) FROM faculty;"
```

### 9.2 Test API Endpoints

```bash
# Test if backend is responding
curl http://localhost:5000/api/health

# Or open in browser: http://localhost:5000/api/faculty
```

### 9.3 Test Frontend

- Open http://localhost:3000
- Try logging in
- Navigate through different pages
- Check if your data appears correctly

---

## Troubleshooting

### Issue: "Docker command not found"

**Solution:**
- Make sure Docker is installed and running
- On Windows: Launch Docker Desktop
- On Linux: `sudo service docker start`
- Verify: `docker --version`

### Issue: "Cannot connect to database"

**Solution:**
```bash
# Check if container is running
docker ps

# Check container logs
docker logs faculty_load_postgres

# Restart container
docker-compose restart
```

### Issue: "Port 5432 already in use"

**Solution:**
```bash
# Find what's using the port
# Windows: netstat -ano | findstr :5432
# Linux: sudo lsof -i :5432

# Stop other PostgreSQL instance or change port in docker-compose.yml
```

### Issue: "Backup file not found"

**Solution:**
```bash
# Check current directory
pwd

# List files
ls -la

# Find backup file
find . -name "*.sql"

# Use full path when restoring
./restore-database.sh /full/path/to/backup.sql
```

### Issue: "Permission denied" on scripts

**Solution (WSL/Linux/Mac):**
```bash
chmod +x backup-database.sh restore-database.sh
```

### Issue: "npm install fails"

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json

# Reinstall
npm run install:all
```

### Issue: "Database restore shows errors but works"

**Solution:**
- Some warnings are normal (like "relation already exists")
- As long as you see "INSERT" statements and data counts match, it's working
- Check data with: `SELECT COUNT(*) FROM faculty;`

---

## Quick Reference Commands

```bash
# Navigate to project
cd ~/dev/projects/js-projects/faculty-load-management

# Start database
docker-compose up -d

# Stop database
docker-compose down

# View database logs
docker logs faculty_load_postgres

# Create backup
./backup-database.sh

# Restore backup
./restore-database.sh database-backup/backup.sql

# Start application
npm run dev

# Install dependencies
npm run install:all
```

---

## Summary Checklist

Use this checklist to track your progress:

- [ ] Installed Node.js
- [ ] Installed Docker
- [ ] Installed Git
- [ ] Cloned/copied project files
- [ ] Transferred database backup file
- [ ] Installed project dependencies (`npm run install:all`)
- [ ] Created `.env` file from `.env.example`
- [ ] Updated `.env` with correct settings
- [ ] Started Docker database (`docker-compose up -d`)
- [ ] Verified database is running (`docker ps`)
- [ ] Restored database backup
- [ ] Verified data was restored (checked table counts)
- [ ] Started application (`npm run dev`)
- [ ] Opened application in browser
- [ ] Logged in successfully
- [ ] Verified data appears correctly

---

## Next Steps

Once everything is working:

1. **Create regular backups:**
   ```bash
   ./backup-database.sh
   ```

2. **Commit your changes to GitHub:**
   ```bash
   git add .
   git commit -m "Initial setup on new laptop"
   git push
   ```

3. **Set up automated backups** (optional):
   - Schedule regular backups using cron (Linux) or Task Scheduler (Windows)

4. **Update documentation** if you made any changes

---

## Need Help?

- Check `DATABASE_MIGRATION.md` for detailed database transfer info
- Check `GITHUB_SETUP.md` for GitHub setup
- Check `README.md` for general project info
- Review error messages in terminal/logs

---

**Congratulations!** 🎉 Your project should now be fully set up on your new laptop with all your existing data!

