# Instagram Focus • Stories & Messages Only Desktop App

A distraction-free Instagram desktop application built with **Electron** that strictly allows **Stories** and **Direct Messages (DMs)** while permanently blocking **Reels**, **Explore**, and **infinite feed scrolling**.

---

## 🛡️ Focus Mode Features

- **Direct Messages Only**: Full Instagram Direct messaging interface with real-time conversations, text, audio messages, images, and search inside conversations.
- **Stories Only**: Full access to your friends' Stories (top carousel and story viewer player). You can view stories, react to stories, and reply to stories (which seamlessly sends a DM).
- **🚫 Reels Blocked**: Reels buttons, tabs, links, and player URLs are blocked across the entire app. Any attempt to access `/reels/` automatically redirects back to your Messages inbox or Stories with a focus notification.
- **🚫 Explore Blocked**: Explore grid and search recommendation feeds are removed.
- **🚫 Feed Scrolling Blocked**: The infinite post feed on the home page is replaced with a clean Focus card so you can never get stuck doomscrolling.
- **Persistent Session**: Log in once directly via Instagram's official login; your session stays safely persisted on your computer in an encrypted Electron profile (`persist:instagram_focus_session`).
- **Top Focus Toolbar**: Floating quick-switcher at the top right:
  - 💬 **Messages** (Quick jump to `/direct/inbox/`)
  - 📸 **Stories** (Quick jump to Stories tray)
  - 🛡️ **Focus Shield Status** (Reels Blocked)
  - 🔄 **Refresh**

### ⚡ Quick Start: Launch Instagram Focus App

1. Double-click [`Start-App.bat`](file:///d:/ALL%20USER/TOOL/insta%20f/Start-App.bat) in the project folder.
2. Or run from the command line:
   ```bash
   npm run app
   ```
3. To place a shortcut on your Desktop, double-click [`Create-Desktop-Shortcut.bat`](file:///d:/ALL%20USER/TOOL/insta%20f/Create-Desktop-Shortcut.bat).

---

## 📌 Alternate: Meta Graph API Messaging Dashboard

A minimal, private web application built with **Next.js**, **React**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, and **PostgreSQL** that connects your Instagram account using **Meta's official Instagram Graph API (v22.0)**.

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

---

## 🛠️ Requirements & Setup for Web Dashboard (Optional)

- **Node.js**: v18.17+ or v20+
- **Database**: PostgreSQL (local PostgreSQL, Supabase, Neon, or Railway)
- **Meta Developer Account**: [developers.facebook.com](https://developers.facebook.com)
- **Instagram Account**: Professional (Creator or Business) Account connected to a Facebook Page.

### Running Automated Tests
```bash
npm test
```
