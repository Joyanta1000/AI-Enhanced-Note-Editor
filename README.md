# 🧠 AI-Enhanced Note Editor

A Laravel 12 + React + Inertia.js application enhanced with GPT-4.1 Nano for real-time note summarization, Google OAuth login, Tiptap rich-text editing, and auto-saving capabilities.

---

## 🚀 Features

- Laravel 12 with Inertia.js + React frontend
- Google OAuth integration via Socialite
- OpenAI integration (gpt-4o-mini) with streaming support
- Rich text editing using [Tiptap](https://tiptap.dev/) (with bold, italic, underline, code, strike support)
- Real-time AI-powered content summarization
- Auto-save on content change
- Export note to `.html` file (Raw PHP based export)
- Pest-powered testing setup
- MySQL database support

---

## 🛠️ Setup Instructions

### 1. 📦 Clone the Repository

```bash
git clone <your-repo-url>
cd <project-folder>
```

---

### 2. ⚙️ Backend Setup

#### Install Composer Dependencies

```bash
composer install
```

#### Environment Configuration

Copy `.env.example` to `.env` and set the following keys:

```env


GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost/auth/google/callback

## http://localhost/auth/google/callback also add to google oauth's authorized url setup to authorize it

OPENAI_API_KEY=your_openai_api_key
```

#### Generate App Key

```bash
php artisan key:generate
```

#### Run Migrations

For a clean DB setup:

```bash
php artisan migrate
```

#### Storage link

To link storage to upload and show files :

```bash
php artisan storage:link
```
---

### 3. 🔧 Frontend Setup

#### Install Node Modules

```bash
npm install
```

#### Run Vite Development Server

```bash
npm run dev
```

---

### 4. ✨ Package Installation Overview

#### Google OAuth Setup

```bash
composer require laravel/socialite
```

- Migrated `avatar` and `google_id` to `users` table.
- Configured Google credentials in `.env`.
- OAuth redirect URI set and handled.
- Modified `HandleInertiaRequests.php`:
  - Shared `auth` data for avatar and name
  - Shared `flash` messages for success/error UX

#### OpenAI Integration

```bash
composer require openai-php/laravel
php artisan vendor:publish --provider="OpenAI\Laravel\ServiceProvider"
```

- Set `OPENAI_API_KEY` in `.env`
- Uses `gpt-4o-mini` model
- Supports streaming via `text/event-stream`
- Integrated in both **create** and **edit** notes

#### Rich Text Editor Setup (Tiptap)

```bash
npm install @tiptap/react @tiptap/starter-kit
npm install @tiptap/extension-underline
```

- Supports **Bold**, **Italic**, **Underline**, **Strike**, **Code**

#### Axios

```bash
npm install axios
```

- Used for backend communication (including AI request)

#### Auto-save in Edit Mode

- Debounced auto-save after 2s inactivity
- Triggered again after AI summarization completes

#### Note Export

- Export individual note as `.txt`
- Raw PHP export logic in:
  ```
  resources/exports/export-note.php
  ```

---

## 🧪 Testing with Pest

```bash
composer require pestphp/pest --dev
php artisan pest:install
php artisan test
```

---

## ✅ To Run the Project Locally

```bash
# Clone repo
git clone <repo-url>
cd <project-dir>

# Backend setup
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate # or import SQL file

# Frontend setup
npm install
npm run dev
```

Open browser and go to:  
📍 `http://localhost`

---



## 🔐 Auth & Flash

- Avatar & name sent via Inertia shared props
- Flash messages show `success` / `error` after user actions

---

## ✨ Author

Developed by **[Joyanta Dutta]**
