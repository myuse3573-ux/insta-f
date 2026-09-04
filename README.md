# Personal Instagram Messaging Dashboard

A minimal, private web application built with **Next.js**, **React**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, and **PostgreSQL** that connects your Instagram account using **Meta's official Instagram Graph API (v22.0)**.

---

## 📌 1. Official API Scope & Limitations

### What Official Meta API v22.0 Supports
- **Official Meta OAuth Login**: Authenticates safely without requesting or storing your password.
- **Conversations & Message Threads**: View message history available via official Graph API endpoints.
- **Sending Direct Replies**: Send text messages directly to active threads.
- **Real-time Incoming Webhooks**: Receive new Instagram messages instantly via Meta Webhook subscriptions.

### What Official Meta API Does NOT Support & API Rules
- ❌ **Friends' Instagram Stories**: Friends' Stories are intentionally **not implemented** because they are not available through the official Graph API used by this application.
- ❌ **Personal (Non-Professional) Instagram Accounts**: Meta's Graph API for Messaging strictly requires an **Instagram Professional Account** (Creator or Business account) linked to a **Facebook Page**. Personal accounts cannot access the Graph Messaging API.
- ❌ **Password Scraping or Automation**: Browser automation (Puppeteer, Selenium, Playwright), session cookie scraping, or reverse-engineered Instagram APIs are **never used** or supported.
- ⏱️ **24-Hour Messaging Window**: Meta restricts automated/API replies to within 24 hours of the user's last incoming message unless specific approved message tags are used.

> **Note for Personal Use**: You can convert any personal Instagram account into a free **Creator Account** inside the Instagram mobile app settings under *Account type and tools -> Switch to professional account -> Creator*, and link it to a Facebook Page to use Meta's official messaging APIs!

---

## 🛠️ 2. Requirements

- **Node.js**: v18.17+ or v20+
- **Database**: PostgreSQL (local PostgreSQL, Supabase, Neon, or Railway)
- **Meta Developer Account**: [developers.facebook.com](https://developers.facebook.com)
- **Instagram Account**: Professional (Creator or Business) Account connected to a Facebook Page.

---

## 🚀 3. Local Installation & Quick Start

1. **Clone the repository and install dependencies**:
   ```bash
   git clone <repository-url>
   cd instagram-messaging-dashboard
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Fill in your PostgreSQL `DATABASE_URL`, `META_APP_ID`, `META_APP_SECRET`, `META_REDIRECT_URI`, `META_VERIFY_TOKEN`, and `ENCRYPTION_SECRET`.

3. **Set Up Database Schema**:
   Run Prisma migrations to create PostgreSQL tables (`instagram_accounts`, `conversations`, `messages`):
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Start Application & Open Directly**:
   - **Desktop Shortcut**: Double-click the **`Instagram Messaging Dashboard`** shortcut created on your Desktop!
   - **Click-to-Run Starter File**: Double-click [`Start-App.bat`](file:///d:/ALL%20USER/TOOL/New%20folder/Start-App.bat) in the project folder to start the server and open the app in your browser automatically.
   - **Command line launcher**:
     ```bash
     npm run open
     # or
     npm run dev
     ```
   - **Create Shortcut anytime**: Double-click [`Create-Desktop-Shortcut.bat`](file:///d:/ALL%20USER/TOOL/New%20folder/Create-Desktop-Shortcut.bat) to regenerate your desktop launcher icon.

---

## 🔑 4. Meta Developer Setup Guide

To connect your Instagram account and receive real-time webhooks:

### Step 1: Create a Meta App
1. Go to [Meta for Developers Dashboard](https://developers.facebook.com/apps/).
2. Click **Create App** -> Select **Other** -> Choose **Business** app type.
3. Name your app (e.g. `Personal Instagram Dashboard`).

### Step 2: Add Products & Permissions
1. Add the **Instagram** product to your app.
2. In **App Settings -> Basic**, copy your **App ID** and **App Secret** into your `.env` file.
3. Under **Permissions and Features**, request:
   - `instagram_basic`
   - `instagram_manage_messages`
   - `pages_show_list`
   - `pages_read_engagement`

### Step 3: Configure Facebook Login / OAuth Redirect URI
1. In Facebook Login Settings, add your valid OAuth Redirect URI:
   `http://localhost:3000/api/instagram/callback`
   *(In production, replace with your live domain `https://yourdomain.com/api/instagram/callback`)*

### Step 4: Configure Webhooks
1. In Meta Dashboard, go to **Webhooks** -> Select **Instagram**.
2. Set Callback URL: `https://<your-ngrok-or-domain>/api/webhooks/instagram`
3. Set Verify Token: The secret string matching `META_VERIFY_TOKEN` in your `.env`.
4. Subscribe to the `messages` event field.

### Step 5: Add App Testers (Development Mode)
1. Go to **App Roles -> Roles**.
2. Add your Instagram Account / Facebook User as an **Instagram Tester** or **Developer**.
3. Accept the tester invite in your Instagram Account Settings under *Apps and Websites -> Tester Invites*.

---

## 📋 5. Development Mode Checklist

- [x] Meta App created in Meta Developer Console
- [x] Instagram Account converted to Creator/Business & linked to Facebook Page
- [x] OAuth redirect URI configured
- [x] Access tokens encrypted with AES-256-GCM server-side
- [x] Account information & conversation threads displayed
- [x] Send DM replies working via official Graph API `v22.0`
- [x] Webhook challenge GET verification passing
- [x] Incoming webhook POST events verified via HMAC signature (`X-Hub-Signature-256`)
- [x] Duplicate messages deduplicated in database
- [x] Real-time UI updates via Server-Sent Events (SSE)

---

## 🧪 6. Running Automated Tests

Run the test suite for token security, encryption, and webhook signature verification:
```bash
npm test
```

---

## 🔒 7. Security Architecture

- **Zero Token Exposure**: Page Access Tokens are encrypted with AES-256-GCM in PostgreSQL and decrypted strictly in server-side API routes. Access tokens are never sent to the browser or logged.
- **HMAC Signature Validation**: All incoming Webhook POST requests are authenticated using `crypto.timingSafeEqual` against `X-Hub-Signature-256`.

---

## 📄 8. License & Disclaimer

Built with Meta official Instagram Graph API v22.0. This application adheres to Meta Platform Terms and Developer Policies.
