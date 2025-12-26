# GitHub Setup Guide

This guide will help you upload your Faculty Load Management System to GitHub and set up the database.

## Prerequisites

- Git installed on your system
- GitHub account
- PostgreSQL installed (or use Docker)

## Step 1: Prepare Your Repository

### 1.1 Check Current Status

Your repository is already initialized. Check what needs to be committed:

```bash
git status
```

### 1.2 Review .gitignore

The `.gitignore` file is already configured to exclude:
- `node_modules/`
- `.env` files
- Build outputs (`dist/`, `build/`)
- Log files
- IDE files

### 1.3 Create Environment Example Files

Make sure `.env.example` exists (already created) so others know what environment variables are needed.

## Step 2: Commit Your Changes

### 2.1 Stage All Changes

```bash
# Add all modified and new files
git add .

# Or add files selectively:
git add backend/
git add frontend/
git add database/
git add docker-compose.yml
git add package.json
git add README.md
```

### 2.2 Commit Changes

```bash
git commit -m "Initial commit: Faculty Load Management System

- Complete backend API with TypeORM and Express
- React frontend with Material-UI
- PostgreSQL database schema
- Docker Compose setup for database
- Authentication and authorization
- Faculty, Course, Assignment, and Schedule management"
```

## Step 3: Create GitHub Repository

### 3.1 Create Repository on GitHub

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Fill in the details:
   - **Repository name**: `faculty-load-management`
   - **Description**: "Faculty Load Management System for PUP based on OVPAA Memorandum No. 5, Series of 2025"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (you already have these)
5. Click "Create repository"

### 3.2 Connect Local Repository to GitHub

If you haven't set a remote yet, or want to update it:

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/faculty-load-management.git

# Or if remote already exists, update it:
git remote set-url origin https://github.com/YOUR_USERNAME/faculty-load-management.git

# Verify remote
git remote -v
```

### 3.3 Push to GitHub

```bash
# Push to main branch
git push -u origin main

# If you get authentication errors, you may need to:
# - Use a Personal Access Token instead of password
# - Or set up SSH keys
```

## Step 4: Database Setup

### Option A: Using Docker (Recommended for Development)

The project includes a `docker-compose.yml` file for easy database setup:

```bash
# Start PostgreSQL database
docker-compose up -d

# Check if database is running
docker ps

# The database will be automatically initialized with schema.sql
```

### Option B: Manual PostgreSQL Setup

1. **Install PostgreSQL** (if not already installed):
   ```bash
   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   
   # macOS (using Homebrew)
   brew install postgresql
   ```

2. **Create Database**:
   ```bash
   # Connect to PostgreSQL
   sudo -u postgres psql
   
   # Create database
   CREATE DATABASE faculty_load_db;
   
   # Exit PostgreSQL
   \q
   ```

3. **Run Schema**:
   ```bash
   # Run the schema file
   psql -U postgres -d faculty_load_db -f database/schema.sql
   ```

### Option C: Using Cloud Database (Production)

For production deployments, consider using:
- **Heroku Postgres**
- **AWS RDS**
- **Google Cloud SQL**
- **DigitalOcean Managed Databases**

Update your `.env` file with the cloud database credentials.

## Step 5: Environment Configuration

### 5.1 Backend Environment

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=faculty_load_db
PORT=5000
JWT_SECRET=your-very-secure-secret-key-minimum-32-characters
NODE_ENV=development
```

**Important**: 
- Never commit `.env` files to GitHub (already in `.gitignore`)
- Use a strong, random `JWT_SECRET` in production
- Change default passwords

### 5.2 Frontend Environment

Create a `.env` file in the `frontend/` directory:

```bash
cd frontend
cp ../.env.example .env
```

Or create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

For production, update to your backend URL:
```env
VITE_API_URL=https://your-api-domain.com/api
```

## Step 6: Install Dependencies and Run

```bash
# Install all dependencies
npm run install:all

# Start development servers (backend + frontend)
npm run dev

# Or start separately:
npm run dev:backend  # Backend on http://localhost:5000
npm run dev:frontend # Frontend on http://localhost:3000
```

## Step 7: Database Migrations (Optional)

If you need to run migrations:

```bash
cd backend
npm run migration:run
```

## Additional GitHub Features

### Add Repository Topics

On GitHub, go to your repository → Settings → Topics, and add:
- `nodejs`
- `react`
- `typescript`
- `postgresql`
- `express`
- `material-ui`
- `education`

### Add Repository Description

Update the repository description on GitHub with:
"Faculty Load Management System for PUP - Automated scheduling with ITEES-based load management"

### Create GitHub Actions (CI/CD) - Optional

You can create `.github/workflows/ci.yml` for automated testing and deployment.

## Security Checklist

Before pushing to GitHub, ensure:

- [ ] `.env` files are in `.gitignore`
- [ ] No passwords or secrets in code
- [ ] `JWT_SECRET` uses a strong random value
- [ ] Database credentials are not hardcoded
- [ ] Sensitive data files are excluded

## Troubleshooting

### Git Authentication Issues

If you encounter authentication errors:

1. **Use Personal Access Token**:
   - GitHub → Settings → Developer settings → Personal access tokens
   - Generate new token with `repo` scope
   - Use token as password when pushing

2. **Use SSH**:
   ```bash
   # Generate SSH key
   ssh-keygen -t ed25519 -C "your_email@example.com"
   
   # Add to GitHub: Settings → SSH and GPG keys
   # Update remote URL
   git remote set-url origin git@github.com:YOUR_USERNAME/faculty-load-management.git
   ```

### Database Connection Issues

- Verify PostgreSQL is running: `pg_isready` or `docker ps`
- Check database credentials in `.env`
- Ensure database exists: `psql -U postgres -l`
- Check firewall/port access (5432)

## Next Steps

1. **Documentation**: Update README.md with specific setup instructions
2. **Issues**: Create GitHub Issues for known bugs or features
3. **Releases**: Tag your first release: `git tag v1.0.0 && git push origin v1.0.0`
4. **Contributing**: Add CONTRIBUTING.md if accepting contributions
5. **License**: Ensure LICENSE file is present

## Database Backup and Restore

### Backup Database

```bash
# Using pg_dump
pg_dump -U postgres -d faculty_load_db > backup.sql

# Or using Docker
docker exec faculty_load_postgres pg_dump -U postgres faculty_load_db > backup.sql
```

### Restore Database

```bash
# Restore from backup
psql -U postgres -d faculty_load_db < backup.sql

# Or using Docker
docker exec -i faculty_load_postgres psql -U postgres faculty_load_db < backup.sql
```

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in `.env`
2. Use a production database (cloud-hosted)
3. Use strong, unique `JWT_SECRET`
4. Enable HTTPS
5. Set up proper CORS configuration
6. Use environment-specific API URLs
7. Set up database backups
8. Configure logging and monitoring

