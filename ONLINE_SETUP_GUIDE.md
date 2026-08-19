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

## ⚡ Step 2: Create & Connect Redis (Upstash / Vercel KV) Storage

To enable persistent cloud backup and cross-device sync:

### Option A: Upstash Redis on Vercel (Recommended)
1. In your project dashboard on Vercel, click the **Storage** tab in the top navigation bar.
2. Click **Create Database** $\rightarrow$ select **Upstash Redis** (or **KV**) $\rightarrow$ click **Continue**.
3. Choose your nearest region and click **Create**.
4. Click **Connect Project** $\rightarrow$ select your `OrganizationApp` project $\rightarrow$ select environments (**Production**, **Preview**, **Development**).
5. Vercel automatically injects `UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN` (or `KV_REST_API_URL` & `KV_REST_API_TOKEN`) into your serverless environment.

### Option B: External Upstash Database
If you already have a database on [Upstash.com](https://upstash.com):
1. Copy your **REST URL** and **REST Token** from the Upstash Console.
2. In Vercel Project Settings $\rightarrow$ **Environment Variables**, add:
   - `UPSTASH_REDIS_REST_URL` = `https://...upstash.io`
   - `UPSTASH_REDIS_REST_TOKEN` = `your_upstash_token`
3. Redeploy your project so the serverless function receives the new environment variables.

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
