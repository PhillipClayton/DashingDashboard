# Dashing Dashboard

A personal, kiosk-style dashboard with an auto-cycling carousel. It keeps only the features for personal use: **To Do List, Shopping List, Weather, Joke of the Day, and Word of the Day**. Lists can be edited from the dashboard host or another device on your local network.

## Features

- Five dashboard slides: To Do, Shopping, Weather, Joke of the Day, and Word of the Day
- Password-protected list editors at `/todo` and `/shopping`, linked from `/admin`
- List data is stored by the server and shared with all devices using the dashboard
- Server listens on all network interfaces by default (`HOST=0.0.0.0`) for LAN access

## Requirements

- Node.js 18+
- Optional: Raspberry Pi or another always-on device for a kiosk display

## Setup

1. Install dependencies:

   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

2. Copy `.env.example` to `.env`. Set `ADMIN_PASSWORD` to a strong password and configure `WEATHER_LAT` and `WEATHER_LON` for your location. The server defaults to port `3001` and listens on all interfaces. You can change `PORT` if needed; leave `HOST=0.0.0.0` for LAN access.

3. Build and start:

   ```bash
   npm run build
   npm start
   ```

   On the host, open `http://localhost:3001`. On a phone or another computer connected to the same network, open `http://<host-LAN-IP>:3001` (for example, find the host's address in its network settings or router). Then visit `/admin` to open the list editor links. Sign in with `ADMIN_PASSWORD` when prompted.

   You may also use a local hostname, such as `http://dashingdashboard.local:3001`, if your operating system/router provides local DNS or mDNS for that name. The hostname is configured on the host/router, not in this app. If another device cannot connect, check that it is on the same network, that the server is running, and that the host firewall allows inbound connections on the configured port.

## Editing lists

- `/admin` links to the To Do and Shopping editors.
- `/todo` supports adding, editing, reordering, prioritizing, completing, and removing tasks.
- `/shopping` supports adding, checking off, and deleting shopping items.
- Changes are saved to the server's `DATA_DIR` and appear on the dashboard for all connected devices.

The dashboard carousel advances every 25 seconds. You can also select a slide with the dots or click the slide to advance.

## Development

- Frontend and server: `npm run dev` (or run `npm run dev:frontend` and `npm run dev:server` in separate terminals)
- After changing frontend or server code, rebuild with `npm run build` and restart the server.

## Kiosk (optional)

Open the dashboard on the kiosk device in a browser's kiosk mode, using the host's LAN IP or local hostname, for example:

```bash
chromium-browser --kiosk --noerrdialogs --disable-infobars http://<host-LAN-IP>:3001/
```

## License

MIT
