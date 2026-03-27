# Matcha Project (Secure API Key Setup)

## 1) Install Node.js
Install Node.js 18+ (includes `npm`).

## 2) Install dependencies
```bash
npm install
```

## 3) Add your API key
```bash
cp .env.example .env
```
Then edit `.env` and set `GEMINI_API_KEY`.

## 4) Start server
```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000).

## Security notes
- API key is stored only in `.env` (server side), not in `index.html`.
- Never commit `.env`.

## Deploy on Vercel
1. Push this project to GitHub.
2. Import repo in Vercel.
3. In Vercel Project Settings -> Environment Variables, add:
   - `GEMINI_API_KEY` = your real key
   - `GEMINI_MODEL` = `gemini-2.0-flash` (optional)
4. Redeploy.

The frontend calls `/api/analyze`, and Vercel serves this via `api/analyze.js`.
