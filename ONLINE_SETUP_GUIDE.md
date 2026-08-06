# Cronograma - Online Setup & Cross-Platform Sync Guide

This guide will walk you through hosting **Cronograma** online for free using GitHub Pages (via GitHub Actions) and configuring cross-platform backup sync (Desktop & Mobile) using GitHub API.

---

## 🌐 Step 1: Enable GitHub Pages Deployment (GitHub Actions)

1. Go to your repository settings on GitHub: **[KernelN/OrganizationApp Settings](https://github.com/KernelN/OrganizationApp/settings/pages)**.
2. In the left sidebar, click **Pages** (under *Code and automation*).
3. Under **Build and deployment**:
   - Set **Source** dropdown to **GitHub Actions**.

### How Deployment Works:
- **Automatic**: Every time you push code changes to the `main` branch, GitHub Actions will automatically run `.github/workflows/deploy.yml` to build Vite and deploy the live app.
- **Manual Trigger**: To trigger a deployment manually at any time:
  1. Go to the **Actions** tab at the top of your repository.
  2. Click **Deploy to GitHub Pages** in the left menu.
  3. Click **Run workflow** (top right) $\rightarrow$ Select `main` $\rightarrow$ Click **Run workflow**.

4. Once deployed (~30 seconds), your app will be live at:
   👉 **`https://KernelN.github.io/OrganizationApp/`**

---

## 🔑 Step 2: Create a Dedicated Backup Sync Branch

To keep your personal tasks, schedules, and settings separate from the main application source code:

1. In your repository on GitHub: **[KernelN/OrganizationApp](https://github.com/KernelN/OrganizationApp)**.
2. Click the branch dropdown (`main`) $\rightarrow$ type `backup-data` $\rightarrow$ click **Create branch: backup-data**.

---

## 🔐 Step 3: Generate a GitHub Personal Access Token (PAT)

Your PAT allows Cronograma running in your browser (Desktop or Mobile) to privately save and load data from your GitHub repository.

1. Go to GitHub $\rightarrow$ **Settings** (Click your profile avatar at top-right $\rightarrow$ **Settings**).
2. Scroll down the left sidebar and click **Developer settings**.
3. Under **Personal access tokens**, choose **Fine-grained tokens** (or **Tokens (classic)**):
   - **Token name**: `Cronograma Sync`
   - **Expiration**: Choose your preferred duration (e.g. 90 days or No expiration).
   - **Repository access**: Select *Only select repositories* $\rightarrow$ pick `KernelN/OrganizationApp`.
   - **Permissions**: Expand **Repository permissions** $\rightarrow$ set **Contents** to **Read and write**.
4. Click **Generate token** and copy your token string (starts with `github_pat_` or `ghp_`).

---

## 📲 Step 4: Configure Sync on Desktop & Mobile Browsers

Open **`https://KernelN.github.io/OrganizationApp/`** on any browser (Desktop computer, Phone, Tablet):

1. Open **Settings** inside Cronograma.
2. Under **🔄 GitHub Backup Sync**:
   - Check **Enable Sync**.
   - **Personal Access Token (PAT)**: Paste your token.
   - **Repo Owner**: `KernelN`
   - **Repo Name**: `OrganizationApp`
   - **Target Branch**: `backup-data`
   - **Data Folder Path**: `data/`
3. Click **Test Connection**. You should see `✅ Connection successful!`.
4. Click **Sync Now (Push)** to backup local data, or **Pull from GitHub** to restore data onto a new device.

---

## 📱 Step 5: Install as a Mobile & Desktop PWA

Cronograma is a full Progressive Web App (PWA) that can be installed on home screens for an app-like experience with offline support:

### iOS (iPhone / iPad)
1. Open `https://KernelN.github.io/OrganizationApp/` in **Safari**.
2. Tap the **Share** button (bottom toolbar).
3. Scroll down and tap **Add to Home Screen**.
4. Launch Cronograma directly from your iOS Home Screen!

### Android (Phone / Tablet)
1. Open `https://KernelN.github.io/OrganizationApp/` in **Chrome**.
2. Tap the 3 dots menu (top-right).
3. Tap **Install app** or **Add to Home Screen**.

### Desktop (Chrome / Edge / Brave)
1. Look for the **Install App** icon in the address bar (top right).
2. Click **Install** to add Cronograma to your Desktop applications.
