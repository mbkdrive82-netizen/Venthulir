# Venthulir — Production Deployment Guide 🚀

## 1. Production Build Status
- **Framework:** Next.js 15.5+ (App Router)
- **Database:** MongoDB (Mongoose)
- **Status:** **PASSED** (`npm run build` generated 54/54 static & dynamic routes with 0 errors).

---

## 2. Environment Variables Checklist
Make sure to add these in your hosting dashboard (e.g. Vercel / VPS `.env`):

```env
# MongoDB Atlas Connection URI
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/venthulir?retryWrites=true&w=majority

# JWT Secret Key for Authentication
JWT_SECRET=your_super_secure_jwt_secret_key_here

# App URL (Domain)
NEXT_PUBLIC_APP_URL=https://venthulir.com

# Razorpay Live Credentials
RAZORPAY_KEY_ID=rzp_live_xxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx

# Google OAuth (Optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com

# Admin Email
ADMIN_EMAIL=admin@venthulir.com
```

---

## 3. Deploying to Vercel (Recommended — 1-Click)
1. Push your repository to **GitHub / GitLab**.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import the `Venthulir` repository.
4. In **Environment Variables**, paste all variables from the checklist above.
5. Click **Deploy**. Vercel will run `npm run build` and launch globally with 0ms edge latency and automatic SSL.

---

## 4. Deploying to a VPS / Ubuntu Server (Node.js / PM2 / Nginx)

### Step 1: Install Dependencies & Build
```bash
git clone <your-repo-url>
cd "Venthulir new"
npm install --production=false
npm run build
```

### Step 2: Start with PM2
```bash
npm install -g pm2
pm2 start npm --name "venthulir" -- start -- -p 3000
pm2 save
pm2 startup
```

### Step 3: Nginx Reverse Proxy Config
```nginx
server {
    server_name venthulir.com www.venthulir.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 5. Master Admin Login
- **URL:** `https://your-domain.com/admin`
- **Email:** `admin@venthulir.com` (or username `admin`)
- **Password:** `admin123`
