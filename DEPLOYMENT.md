# Deployment Settings

## Local Development

Keep `client/.env` pointed at the local backend:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Run locally with two terminals:

```bash
cd server
npm start
```

```bash
cd client
npm run dev
```

Frontend: `http://localhost:5173`
Backend products API: `http://localhost:5000/api/products`

## Railway Backend

Deploy from the repo root. `railway.json` starts the backend from `server`.

Set these Railway variables:

```env
MONGO_URI=your_mongodb_connection_string
FRONTEND_URL=https://your-vercel-frontend-url.vercel.app
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password
```

Railway start command:

```bash
cd server && npm start
```

## Vercel Frontend

Deploy from the repo root. `vercel.json` builds the frontend from `client`.

Set this Vercel variable:

```env
VITE_API_BASE_URL=https://your-railway-backend-url.up.railway.app/api
```

Vercel build settings:

```txt
Framework Preset: Vite
Install Command: cd client && npm ci
Build Command: cd client && npm run build
Output Directory: client/dist
```

If you instead set Vercel root directory to `client`, use:

```txt
Framework Preset: Vite
Install Command: npm ci
Build Command: npm run build
Output Directory: dist
```

After Vercel deploys, copy the Vercel URL into Railway `FRONTEND_URL`, then redeploy Railway.
