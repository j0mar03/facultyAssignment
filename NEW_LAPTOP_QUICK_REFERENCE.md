# Quick Reference: New Laptop Setup

## 🚀 Quick Setup (5 Minutes)

### Prerequisites
- [ ] Node.js installed (`node --version`)
- [ ] Docker installed (`docker --version`)
- [ ] Git installed (`git --version`)
- [ ] Database backup file (`.sql`)

### Steps

```bash
# 1. Clone project
git clone https://github.com/YOUR_USERNAME/faculty-load-management.git
cd faculty-load-management

# 2. Install dependencies
npm run install:all

# 3. Setup environment
cp .env.example .env
# Edit .env with your settings

# 4. Start database
docker-compose up -d

# 5. Restore backup
./restore-database.sh database-backup/your-backup.sql

# 6. Start application
npm run dev
```

## 📋 Detailed Checklist

See [SETUP_NEW_LAPTOP.md](./SETUP_NEW_LAPTOP.md) for complete instructions.

### Installation
- [ ] Install Node.js
- [ ] Install Docker
- [ ] Install Git

### Project Setup
- [ ] Clone/copy project
- [ ] Transfer database backup file
- [ ] Install dependencies (`npm run install:all`)
- [ ] Create `.env` file
- [ ] Configure `.env` settings

### Database Setup
- [ ] Start Docker
- [ ] Start database (`docker-compose up -d`)
- [ ] Verify database running (`docker ps`)
- [ ] Restore backup
- [ ] Verify data restored

### Application
- [ ] Start app (`npm run dev`)
- [ ] Open browser (http://localhost:3000)
- [ ] Login and verify data

## 🔧 Common Commands

```bash
# Database
docker-compose up -d          # Start database
docker-compose down            # Stop database
docker ps                      # Check running containers
docker logs faculty_load_postgres  # View logs

# Backup/Restore
./backup-database.sh           # Create backup
./restore-database.sh backup.sql  # Restore backup

# Application
npm run dev                    # Start dev servers
npm run dev:backend            # Backend only
npm run dev:frontend           # Frontend only
npm run install:all            # Install all deps
```

## ⚠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| Docker not found | Install Docker Desktop / Start Docker service |
| Port 5432 in use | Stop other PostgreSQL / Change port |
| Backup not found | Check file path / Use full path |
| Permission denied | `chmod +x *.sh` (Linux/WSL) |
| npm install fails | Clear cache, delete node_modules, reinstall |

## 📞 Need Help?

- Full guide: [SETUP_NEW_LAPTOP.md](./SETUP_NEW_LAPTOP.md)
- Database migration: [DATABASE_MIGRATION.md](./DATABASE_MIGRATION.md)
- GitHub setup: [GITHUB_SETUP.md](./GITHUB_SETUP.md)

