# Cronograma - Vercel Online Setup & Cross-Platform Sync Guide

This guide walks you through deploying **Cronograma** for free on [Vercel](https://vercel.com), setting up Vercel KV storage, and using zero-config cloud sync across all your devices (Desktop, iPhone, Android).

---

## 🌐 Step 1: Deploy Cronograma on Vercel

1. Log in to your [Vercel Account](https://vercel.com) (or sign up using GitHub).
2. Click **Add New...** $\rightarrow$ **Project**.
3. Select your GitHub repository **`KernelN/OrganizationApp`** and click **Import**.
4. Framework Preset will automatically be detected as **Vite**.
5. Keep default build settings and click **Deploy**.
6. In ~30 seconds, Vercel will build and launch your application live at your project domain (e.g., `https://organization-app.vercel.app`).

---

## ⚡ Step 2: Connect Redis Storage (Redis Cloud / Upstash / KV)

Cronograma connects natively to Redis via `ioredis` using your `REDIS_URL` connection string.

### Option A: Redis Cloud (cloud.redis.io)
1. Log in to [Redis Cloud](https://cloud.redis.io) and open your database details.
2. Copy your **Public endpoint** connection string (e.g. `redis://default:password@your-endpoint.db.redis.io:19866`).
3. In your **Vercel Project Dashboard** $\rightarrow$ **Settings** $\rightarrow$ **Environment Variables**, add:
   - **Key**: `REDIS_URL`
   - **Value**: `redis://default:password@your-endpoint.db.redis.io:19866`
   - **Target**: Production, Preview, Development
4. Click **Save** and trigger a redeployment (or push a commit) so Vercel applies the environment variable.

### Option B: Upstash Redis / Vercel KV
If you prefer Upstash Redis on Vercel:
1. In Vercel Project Dashboard $\rightarrow$ **Storage** $\rightarrow$ Create/Connect **Upstash Redis**.
2. Add `REDIS_URL` pointing to your Redis URI (e.g. `rediss://default:password@...upstash.io:6379`).

---

## 📱 Step 3: Zero-Config Cloud Sync Across All Devices

Once deployed and connected to Vercel KV:

1. Open your Vercel URL on any computer, phone, or tablet (e.g. `https://organization-app.vercel.app`).
2. **Cronograma is 100% Zero-Config out of the box!**
   - Vercel Sync is **enabled automatically**.
   - All your devices default to the shared sync key `crono_main_sync`.
3. Any task, tag, or schedule created on your phone will automatically push to Vercel Cloud and restore on your laptop!

### Optional: Changing your Sync Key
If you ever want to isolate a specific device or use a custom private database key:
1. Open **Settings** inside Cronograma.
2. Scroll to **⚡ Vercel Serverless Sync**.
3. Click **Generate Key** or enter a custom key string, then click **Sync Now (Push)**.

---

## 📲 Step 4: Install as a Mobile & Desktop PWA

Cronograma is a full Progressive Web App (PWA) that installs directly on home screens with offline support and app-like performance:

### iOS (iPhone / iPad)
1. Open your Vercel URL in **Safari**.
2. Tap the **Share** button (bottom toolbar).
3. Scroll down and tap **Add to Home Screen**.
4. Launch Cronograma directly from your iOS Home Screen!

### Android (Phone / Tablet)
1. Open your Vercel URL in **Chrome**.
2. Tap the 3 dots menu (top-right).
3. Tap **Install app** or **Add to Home Screen**.

### Desktop (Chrome / Edge / Brave / Safari)
1. Look for the **Install App** icon in the address bar (top right).
2. Click **Install** to add Cronograma to your Desktop applications.
