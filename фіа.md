# 🚀 Roomy Deployment Guide

**Останнє оновлення:** 19 жовтня 2025  
**Рекомендований метод:** Vercel (Frontend) + Railway (Backend + Database)

---

## 📋 Передумови

### Що вам потрібно:

1. ✅ **GitHub акаунт** (у вас вже є)
2. ✅ **Vercel акаунт** - [Signup here](https://vercel.com/signup)
3. ✅ **Railway акаунт** - [Signup here](https://railway.app/)
4. ✅ **AWS S3 credentials** (для file uploads)
5. ✅ **JWT Secret** (згенерований нижче)

### Генеруємо JWT Secret:

```bash
openssl rand -base64 64
```

**Ваш JWT Secret (збережіть в безпечному місці):**
```
FqxXiW0Rv0eVcMZOSTx0T8TCLqF9mNtlW/5Gt4O/s44rHZ0Q7j3D9/vFM1+7PKa89ONFRKHvr0csoz09kmrROA==
```

---

## 🎯 Метод 1: Vercel + Railway (Рекомендовано)

### ⏱️ Час: 15-20 хвилин
### 💰 Вартість: ~$5-10/місяць (для початку)

---

## 🔷 Крок 1: Deploy Backend на Railway

### 1.1 Створіть проєкт

1. Відкрийте [Railway Dashboard](https://railway.app/dashboard)
2. Натисніть **"New Project"**
3. Виберіть **"Deploy from GitHub repo"**
4. Виберіть ваш репозиторій: `dvytvytskyi/roomy-crm`
5. Railway автоматично виявить ваш проєкт

### 1.2 Додайте PostgreSQL

1. В вашому проєкті натисніть **"New"**
2. Виберіть **"Database"** → **"PostgreSQL"**
3. Railway автоматично створить базу даних
4. ✅ DATABASE_URL буде автоматично доступний!

### 1.3 Налаштуйте Backend Service

1. Натисніть на ваш backend service
2. Перейдіть в **"Settings"**
3. В **"Root Directory"** вкажіть: `backend-v2`
4. В **"Build Command"** (за замовчуванням має спрацювати):
   ```bash
   npm install && npx prisma generate && npx prisma migrate deploy && npm run build
   ```
5. В **"Start Command"**:
   ```bash
   npm start
   ```

### 1.4 Додайте Environment Variables

Перейдіть в **"Variables"** та додайте:

```bash
# Database (автоматично з'єднано з PostgreSQL service)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT Secret (використайте згенерований вище)
JWT_SECRET=FqxXiW0Rv0eVcMZOSTx0T8TCLqF9mNtlW/5Gt4O/s44rHZ0Q7j3D9/vFM1+7PKa89ONFRKHvr0csoz09kmrROA==

# Server Config
NODE_ENV=production
PORT=3002
FRONTEND_URL=https://your-app.vercel.app
CORS_ORIGIN=https://your-app.vercel.app

# AWS S3 (ВАШ CREDENTIALS)
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=eu-west-3
S3_BUCKET_NAME=roomy-ae

# Optional
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
LOG_LEVEL=info
```

### 1.5 Deploy!

1. Railway автоматично почне deploy
2. Зачекайте 3-5 хвилин
3. Отримайте public URL (наприклад: `https://roomy-backend-production.up.railway.app`)
4. Перевірте: `https://your-backend-url.up.railway.app/health`

✅ **Backend готовий!** Збережіть URL - він потрібен для frontend.

---

## 🔷 Крок 2: Deploy Frontend на Vercel

### 2.1 Імпортуйте проєкт

1. Відкрийте [Vercel Dashboard](https://vercel.com/dashboard)
2. Натисніть **"Add New..."** → **"Project"**
3. Імпортуйте `dvytvytskyi/roomy-crm` з GitHub
4. Vercel автоматично виявить Next.js

### 2.2 Configure Build Settings

**Framework Preset:** Next.js (автоматично)
**Root Directory:** `./` (за замовчуванням)
**Build Command:** `npm run build` (за замовчуванням)
**Output Directory:** `.next` (за замовчуванням)

### 2.3 Додайте Environment Variables

У розділі **"Environment Variables"** додайте:

```bash
# API URLs (використайте ваш Railway backend URL)
NEXT_PUBLIC_API_V2_URL=https://your-backend.up.railway.app/api/v2
BACKEND_API_URL=https://your-backend.up.railway.app

# Build Config
NODE_ENV=production
```

### 2.4 Deploy!

1. Натисніть **"Deploy"**
2. Зачекайте 2-3 хвилини
3. Отримайте ваш public URL (наприклад: `https://roomy.vercel.app`)

✅ **Frontend готовий!**

---

## 🔷 Крок 3: Оновіть CORS на Backend

Тепер у вас є frontend URL, треба оновити CORS на backend:

1. Поверніться в Railway
2. Знайдіть ваш backend service
3. Перейдіть в **"Variables"**
4. Оновіть:
   ```bash
   FRONTEND_URL=https://your-actual-app.vercel.app
   CORS_ORIGIN=https://your-actual-app.vercel.app
   ```
5. Service автоматично перезапуститься

---

## 🧪 Крок 4: Тестування

### 4.1 Перевірте Backend

```bash
# Health check
curl https://your-backend.up.railway.app/health

# Expected response:
{
  "status": "OK",
  "timestamp": "2025-10-19T...",
  "version": "2.0.0",
  "environment": "production"
}
```

### 4.2 Перевірте Frontend

1. Відкрийте `https://your-app.vercel.app`
2. Спробуйте залогінитись
3. Перевірте основні функції

### 4.3 Перевірте Database

```bash
# In Railway PostgreSQL service, open "Data" tab
# You should see tables created by Prisma
```

---

## 🎉 Готово! Ваш додаток live!

### 📱 Production URLs:

- **Frontend:** `https://your-app.vercel.app`
- **Backend API:** `https://your-backend.up.railway.app`
- **Health Check:** `https://your-backend.up.railway.app/health`

---

## 🔄 Автоматичні Деплої

### Vercel:
- ✅ Кожен push в `main` branch автоматично деплоїться
- ✅ Preview deployments для pull requests

### Railway:
- ✅ Кожен push в `main` branch автоматично деплоїться
- ✅ Automatic rollbacks при помилках

---

## 📊 Моніторинг

### Vercel Dashboard:
- Real-time logs
- Performance metrics
- Deployment history

### Railway Dashboard:
- Real-time logs
- Resource usage (CPU, Memory)
- Database metrics

---

## 🐳 Альтернативний метод: Docker Compose

Якщо ви хочете deploy на власному сервері:

### 1. На сервері:

```bash
# Clone repository
git clone https://github.com/dvytvytskyi/roomy-crm.git
cd roomy-crm

# Create .env file
cp ENV_DOCKER.example .env
# Edit .env with your values
nano .env

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f
```

### 2. Налаштуйте Nginx (reverse proxy):

```nginx
# /etc/nginx/sites-available/roomy
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

### 3. Enable SSL:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 🔒 Post-Deployment Security Checklist

- [ ] ✅ JWT_SECRET змінено з default value
- [ ] ✅ DATABASE_URL secure та не hardcoded
- [ ] ✅ CORS налаштовано на правильні domains
- [ ] ✅ AWS credentials встановлено
- [ ] ✅ HTTPS enabled (автоматично на Vercel/Railway)
- [ ] ✅ Rate limiting працює
- [ ] ✅ Environment variables не в коді
- [ ] ✅ Database backups налаштовано

---

## 🆘 Troubleshooting

### Backend не стартує:

```bash
# Check Railway logs:
# 1. Open Railway dashboard
# 2. Click on backend service  
# 3. Go to "Deployments" → Click latest deployment → "View Logs"

# Common issues:
# - DATABASE_URL not set → Add PostgreSQL service
# - JWT_SECRET too short → Use generated 64-char secret
# - Prisma migration failed → Check DATABASE_URL format
```

### Frontend не підключається до Backend:

```bash
# Check environment variables in Vercel:
# 1. Go to Project Settings → Environment Variables
# 2. Verify NEXT_PUBLIC_API_V2_URL points to Railway backend
# 3. Verify BACKEND_API_URL points to Railway backend
# 4. Redeploy after changing variables
```

### CORS Errors:

```bash
# Update CORS_ORIGIN on Railway backend:
CORS_ORIGIN=https://your-actual-vercel-url.vercel.app

# Make sure both URLs match:
# Frontend: https://your-app.vercel.app
# CORS_ORIGIN: https://your-app.vercel.app
```

### Database Connection Errors:

```bash
# In Railway:
# 1. Check PostgreSQL service is running
# 2. Verify DATABASE_URL is linked: ${{Postgres.DATABASE_URL}}
# 3. Check database connection in backend logs
```

---

## 📈 Scaling Up

### When to scale:

- **> 1000 users:** Upgrade Railway plan
- **> 10000 requests/day:** Consider CDN
- **> 100GB database:** Upgrade database plan
- **Heavy compute:** Consider AWS/GCP

### Cost expectations:

| Users | Monthly Cost | Services |
|-------|-------------|----------|
| 0-100 | $5-10 | Vercel Free + Railway Starter |
| 100-1K | $20-50 | Vercel Pro + Railway Pro |
| 1K-10K | $100-300 | Scaled services |
| 10K+ | $500+ | Enterprise solutions |

---

## 📚 Additional Resources

- **Vercel Docs:** https://vercel.com/docs
- **Railway Docs:** https://docs.railway.app
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Prisma Production:** https://www.prisma.io/docs/guides/deployment

---

## ✅ Success Criteria

Your deployment is successful if:

- ✅ Frontend loads at your Vercel URL
- ✅ You can login successfully
- ✅ Backend health check returns OK
- ✅ Database tables created
- ✅ File uploads work (S3)
- ✅ No CORS errors in browser console
- ✅ API requests work from frontend

---

**Need help?** Create an issue in the repository or contact the dev team.

**Last updated:** October 19, 2025

