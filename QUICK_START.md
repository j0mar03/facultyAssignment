# Quick Start Guide - GitHub Upload & Database Setup

## 🚀 Quick Steps to Upload to GitHub

### 1. Prepare Your Code
```bash
# Check what needs to be committed
git status

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: Faculty Load Management System"
```

### 2. Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `faculty-load-management`
3. Description: "Faculty Load Management System for PUP"
4. Choose Public or Private
5. **Don't** initialize with README (you already have one)
6. Click "Create repository"

### 3. Connect and Push
```bash
# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/faculty-load-management.git

# Or update existing remote
git remote set-url origin https://github.com/YOUR_USERNAME/faculty-load-management.git

# Push to GitHub
git push -u origin main
```

## 🗄️ Database Setup

### Option 1: Docker (Easiest)
```bash
# Start database
docker-compose up -d

# Check status
docker ps
```

### Option 2: Local PostgreSQL
```bash
# Create database
createdb faculty_load_db

# Run schema
psql -U postgres -d faculty_load_db -f database/schema.sql
```

### Option 3: Cloud Database
Use services like:
- Heroku Postgres
- AWS RDS
- Google Cloud SQL
- DigitalOcean Managed Databases

Update `.env` with cloud credentials.

## ⚙️ Environment Setup

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your settings:**
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=faculty_load_db
   PORT=5000
   JWT_SECRET=your-secret-key-change-this
   NODE_ENV=development
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Install and run:**
   ```bash
   npm run install:all
   npm run dev
   ```

## 📋 Important Notes

✅ **Already Configured:**
- `.gitignore` - Excludes sensitive files
- `docker-compose.yml` - Database setup
- `database/schema.sql` - Database schema
- `.env.example` - Environment template

⚠️ **Before Pushing to GitHub:**
- Ensure `.env` is in `.gitignore` (already done)
- No passwords in code
- Use strong JWT_SECRET in production

## 📚 Full Documentation

For detailed instructions, see:
- [GITHUB_SETUP.md](./GITHUB_SETUP.md) - Complete GitHub setup guide
- [DATABASE_MIGRATION.md](./DATABASE_MIGRATION.md) - Transfer database between laptops
- [README.md](./README.md) - Project documentation

