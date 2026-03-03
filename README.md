# Dashing Dashboard

A kiosk-style home dashboard that displays chores, schoolwork lists, student progress graphs, shopping list, weather, joke of the day, and word of the day on an auto-cycling carousel. Designed for a modest monitor (e.g. 1080p) in a central location, with a Raspberry Pi in kiosk mode. Data is served and edited via a LAN server so private information stays off GitHub Pages.

## Features

- **Carousel slides**: Chores (4 people), schoolwork/course lists (4 students), progress charts (2×2 from TubularTutor), shopping list, weather (current day), joke of the day, word of the day
- **LAN server**: Serves the dashboard and provides APIs for all data; proxies TubularTutor for progress; no secrets in the frontend bundle
- **Admin UI** (`/admin`): Password-protected forms to edit chores, schoolwork lists, and shopping list
- **Progress charts**: Same logic as [TheLearningMatrix](https://github.com/phillipclayton/TheLearningMatrix); student list and data come from TubularTutor via the server

## Requirements

- Node.js 18+
- TubularTutor backend (e.g. on Render) and an admin token for progress data
- Optional: Raspberry Pi for kiosk display

## Setup

1. **Clone and install**

   ```bash
   cd DashingDashboard
   npm install
   cd frontend && npm install && cd ..
   ```

2. **Environment**

   Copy `.env.example` to `.env` and set:

   - `TUBULAR_TUTOR_URL` – TubularTutor API base (e.g. `https://tubulartutor.onrender.com`)
   - `TUBULAR_TUTOR_ADMIN_TOKEN` – Bearer token for admin (students + progress)
   - `ADMIN_PASSWORD` – Password for the dashboard admin UI (chores, schoolwork, shopping)
   - `PORT` – Server port (default `3001`)
   - `DATA_DIR` – Directory for JSON data (default `./data`)
   - `WEATHER_LAT`, `WEATHER_LON` – Latitude/longitude for weather
   - Optional: `ADMIN_SESSION_SECRET` – For signing JWTs (defaults to `ADMIN_PASSWORD`)

3. **Student list for progress charts**

   Create `data/students.json` (or set `DATA_DIR` and create `students.json` there) with the TubularTutor student IDs and display names:

   ```json
   {
     "students": [
       { "id": 1, "displayName": "Alice" },
       { "id": 2, "displayName": "Bob" }
     ]
   }
   ```

   Up to four entries are used for the 2×2 progress grid.

4. **Build and run**

   ```bash
   npm run build
   npm start
   ```

   Open `http://localhost:3010` (or whatever `PORT` is in `.env`; default in this repo is 3010) for the dashboard. Open `http://localhost:3010/admin` on another device to log in and edit chores, schoolwork, and shopping.

   **After changing frontend or server code**, rebuild and restart:

   ```bash
   npm run build
   npm start
   ```

   If you use **dev mode** (`npm run dev`), the frontend (Vite) hot-reloads; you still need to restart the server if you changed server code.

## Development

- **Frontend only** (with API proxy to server): `npm run dev:frontend` (from repo root) or `cd frontend && npm run dev`
- **Server only**: `npm run dev:server` (from repo root) or `cd server && node index.js`  
  Run both in two terminals for full local dev. The frontend dev server proxies `/api` to `http://localhost:3001`.

## Kiosk (Raspberry Pi)

1. Run the server on a machine on your LAN (or on the Pi itself).
2. On the Pi, open Chromium in kiosk mode to the dashboard URL, e.g.:

   ```bash
   chromium-browser --kiosk --noerrdialogs --disable-infobars http://<lan-server-ip>:3001/
   ```

3. No login is required on the dashboard; it only reads data. Use another device on the LAN to open `/admin` and edit data with the admin password.

## GitHub Pages

The repo is safe to publish: no `.env`, no `data/`, and no TubularTutor token in the frontend. To show a public landing page, build with `VITE_API_BASE` unset and deploy `frontend/dist`; you can display a short message like “Run the LAN server and open this URL from your network” or a minimal demo.

## License

MIT
