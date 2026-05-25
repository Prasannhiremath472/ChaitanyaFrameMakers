# ✦ Chaitanya FrameMakers — eCommerce Platform

Premium Photo Frames & Gift Articles — Full-Stack eCommerce Platform built with React 18, Node.js, Express, MySQL & Razorpay.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### 1. Install Dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Setup Database

```bash
mysql -u root -p < database/schema.sql
```

### 3. Configure `.env` files

**backend/.env** — Fill in your MySQL creds, Gmail app password, Razorpay keys.

**frontend/.env** — Set `VITE_API_URL` and `VITE_RAZORPAY_KEY_ID`.

### 4. Run

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

- Frontend → http://localhost:5173
- Backend  → http://localhost:5000/api

---

## 🔐 Admin Login

| Email | admin@chaitanyaframes.com |
|-------|--------------------------|
| Password | Admin@1234 |
| URL | /admin |

---

## 🛠️ Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, Zustand, Swiper, Recharts  
**Backend:** Node.js, Express, MySQL 8, JWT, Nodemailer, Multer, Razorpay, Helmet  
**AI:** Custom recommendation engine using MySQL queries and occasion-based filtering

---

## 🌐 Deployment (Hostinger)

1. Build frontend: `cd frontend && npm run build`
2. Upload `dist/` to `public_html/`
3. Upload `backend/` to server, run `npm install --production`
4. Start with PM2: `pm2 start server.js --name cfm-api`
5. Import `database/schema.sql` to MySQL

---

*Built with ❤️ — Making memories last forever.*