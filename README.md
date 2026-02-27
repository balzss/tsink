# tsink

A mobile-first Progressive Web App (PWA) for independent service providers to track work hours, income, and expenses. Syncs with Google Calendar and uses Google Sheets as a database — no backend required.

## Features

- **Work Hours**: View daily calendar events, set income amounts and categories per event
- **Expenses**: Track one-time and recurring expenses with dates
- **Summary**: Monthly overview with hours worked, income, profit, and incomplete data alerts
- **Settings**: Theme (Light/Dark/System), language (EN/HU), currency, category management
- **PWA**: Installable on mobile, works offline with cached data
- **Google Sheets as DB**: All data stored in your own Google Spreadsheet

## Quick Start

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Navigate to **APIs & Services > Library**
4. Enable the following APIs:
   - **Google Calendar API**
   - **Google Sheets API**

### 2. Set Up OAuth Consent Screen

1. Go to **APIs & Services > OAuth consent screen**
2. Choose **External** user type
3. Fill in the required fields:
   - App name: `tsink`
   - User support email: your email
   - Developer contact: your email
4. Add scopes:
   - `https://www.googleapis.com/auth/calendar.readonly`
   - `https://www.googleapis.com/auth/spreadsheets`
   - `https://www.googleapis.com/auth/userinfo.profile`
   - `https://www.googleapis.com/auth/userinfo.email`
5. Add your Google account as a test user (while app is in testing)

### 3. Create OAuth Client ID

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth client ID**
3. Application type: **Web application**
4. Add authorized JavaScript origins:
   - `http://localhost:5173` (for development)
   - `https://yourusername.github.io` (for production)
5. Copy the **Client ID**

### 4. Configure the App

```bash
git clone https://github.com/yourusername/tsink.git
cd tsink
npm install
cp .env.example .env
```

Edit `.env` and paste your Client ID:

```
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 6. Deploy to GitHub Pages

```bash
npm run build
```

Deploy the `dist/` folder to GitHub Pages (or use a GitHub Action).

## Tech Stack

- **React 19** + TypeScript (Vite)
- **Tailwind CSS v4** (Dark/Light/System theme)
- **TanStack Query** (API data fetching & caching)
- **Zustand** (Client state management)
- **i18next** (English/Hungarian)
- **Recharts** (Charts)
- **Lucide React** (Icons)
- **vite-plugin-pwa** (Service worker & installability)

## Google Sheets Structure

The app creates/expects a spreadsheet with 3 sheets:

### `income` sheet
| ical_uid | date | amount | category | is_unrelevant |
|----------|------|--------|----------|---------------|

### `expenses` sheet
| id | name | date | amount | is_recurring |
|----|------|------|--------|--------------|

### `config` sheet
| key | value |
|-----|-------|
| categories | ["General"] |

## License

MIT
