# Running Dashing Dashboard on Linux Mint Cinnamon

The dashboard can run on a single Linux Mint computer: the Node.js server serves the built frontend, and a browser on the same machine displays it. No kiosk mode or desktop changes are required, so you can switch to normal computer use whenever you like.

## Install and configure

From a terminal, clone the repository and install its dependencies:

```bash
git clone https://github.com/PhillipClayton/DashingDashboard.git
cd DashingDashboard
npm install
npm install --prefix frontend
```

Install a Node.js version supported by the project (`node --version` and `npm --version` can check the installed versions). Copy `.env.example` to `.env` and configure the settings you need, especially `ADMIN_PASSWORD`. Add TubularTutor credentials and `data/students.json` only if you use the progress slide. Keep `.env` private; it contains passwords or tokens:

```bash
cp .env.example .env
chmod 600 .env
nano .env
```

Build the frontend once:

```bash
npm run build
```

The server's default port is `3001` (or set `PORT` in `.env`). Test it in a terminal with `npm start`, then open `http://localhost:3001` in your browser. Stop the foreground server with `Ctrl+C` before configuring it as a service.

## Run the server as a user service

A systemd *user* service lets the server run in the background without requiring root privileges. It starts when your desktop user logs in; stop or start it at any time.

First, find the absolute path to the cloned repository and the path to `npm`:

```bash
cd ~/DashingDashboard
pwd
command -v npm
```

Create the user service directory and unit file:

```bash
mkdir -p ~/.config/systemd/user
nano ~/.config/systemd/user/dashing-dashboard.service
```

Paste the following, replacing `/home/YOUR_USER/DashingDashboard` with the path printed by `pwd`, and `/usr/bin/npm` with the path printed by `command -v npm` if different:

```ini
[Unit]
Description=Dashing Dashboard

[Service]
Type=simple
WorkingDirectory=/home/YOUR_USER/DashingDashboard
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
```

Load the unit and start it now and automatically on future desktop logins:

```bash
systemctl --user daemon-reload
systemctl --user enable --now dashing-dashboard.service
```

Open `http://localhost:3001` in a normal browser window. Leave the service running while you use other applications; minimize or close the dashboard tab/window to return to the desktop. To stop the server while using the computer, or start it again later:

```bash
systemctl --user stop dashing-dashboard.service
systemctl --user start dashing-dashboard.service
```

To disable automatic start at login:

```bash
systemctl --user disable dashing-dashboard.service
```

Check whether it is running and view recent logs with:

```bash
systemctl --user status dashing-dashboard.service
journalctl --user -u dashing-dashboard.service -n 50
```

After changing application code, rebuild and restart the service:

```bash
npm run build
systemctl --user restart dashing-dashboard.service
```

## Optional: start the browser at login

If you want the dashboard visible after signing in, use Cinnamon's **Startup Applications** to add your browser with `http://localhost:3001` as its URL. Keep it in a normal window (not kiosk/full-screen mode) so you can switch to other work. The server service and browser are separate: closing the browser does not stop the server, and stopping the service leaves the browser open but unable to load dashboard data.

## Local-only versus LAN access

By default, the server listens on all network interfaces, so other devices on your home network may also be able to reach it at `http://<iMac-LAN-IP>:3001`. The admin interface allows edits protected by `ADMIN_PASSWORD`; use a strong password and do not expose this port to the public internet. If you only need the dashboard on the iMac, use `localhost` and configure the host firewall to block access from other devices if desired.
