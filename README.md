# tsink

Mobile-first PWA for independent service providers to track work hours, income, and expenses. Uses Google Calendar and Google Sheets as a backend — no server required.

## Setup

1. Enable **Google Calendar API** and **Google Sheets API** in [Google Cloud Console](https://console.cloud.google.com/)
2. Create an OAuth 2.0 Client ID (Web application) with your deployment URL as an authorized origin
3. Clone, install, and set your client ID:

```bash
npm install
cp .env.example .env  # add your VITE_GOOGLE_CLIENT_ID
npm run dev
```

## Tech

React 19, TypeScript, Vite, Tailwind CSS v4, TanStack Query, Zustand, i18next, vite-plugin-pwa

## License

MIT
