# Indyscan Webapp
NextJS based UI for viewing transactions.

# Development
If you would like to contribute, getting started is easy. You can run webapp
locally a point it towards https://indyscan.io API. Let's do that

### 1. Update API link in `nodemon.json`
In `nodemon.json` set value `INDYSCAN_API_URL` to `https://indyscan.io`

### 2. Start webapp for dev
Run `npm run dev`
  
# Configuration

Example:

- `INDYSCAN_API_URL` - Address of Indyscan API (example: `http://localhost:3708`)

- `DAEMON_WS_URL` - Address where to forward websockets for live scanner updates (example: `http://localhost:3709`)

- `PORT` - Port where the webapp should serve (example: `3707`)
 
- `LOG_LEVEL` - `debug`

- `LOG_HTTP_REQUESTS` - `true`

- `LOG_HTTP_RESPONSES` - `true`

