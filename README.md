# Fashion Tracker

A standalone Vite + React app for the Brand Quality Index.

## 1. Install Node.js

Install the current LTS version from [nodejs.org](https://nodejs.org/). Restart VS Code afterward, then confirm in a new terminal:

```sh
node --version
npm --version
```

## 2. Install dependencies

From this folder, run:

```sh
npm install
```

## 3. Create the Supabase database

1. Create a free project at [supabase.com](https://supabase.com/).
2. Open **SQL Editor** in the Supabase dashboard.
3. Paste the contents of `supabase.sql` and click **Run**.
4. Open **Project Settings > API** and copy the **Project URL** and the public **publishable/anon key**.

Create a local environment file:

```sh
cp .env.example .env
```

Put those two Supabase values in `.env` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

The schema stores brands, ordered rankings, size-chart JSON, and price-guide JSON in separate tables. The policies in `supabase.sql` are intentionally simple for this personal, single-user app. If this becomes a multi-user app, add Supabase Auth and user-scoped rows before deploying publicly.

## 4. Create an Anthropic API key

1. Create an account at [console.anthropic.com](https://console.anthropic.com/).
2. Add billing/credits if requested.
3. Create an API key and put it in `.env` as `ANTHROPIC_API_KEY`.

Keep this key server-only. Do not rename it with a `VITE_` prefix and do not commit `.env`.

## 5. Run locally

```sh
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

The browser talks to `/api/claude`; Vite forwards that request to the local Express server on port `8787`. Anthropic credentials never go to the browser. On an empty Supabase database, the app seeds the built-in brand catalog and rankings automatically.

## Production direction

Deploy the frontend and API together on a platform that supports Node server processes, or move `server/index.js` into that platform's serverless function format. Add the three environment variables in the host's dashboard and configure the frontend/API origin together so `/api/claude` remains available.
