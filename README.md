# Telemetry Frontend

React + TypeScript SPA for monitoring vehicle telemetry, built with Vite and Ant Design.

## Local Development

```bash
npm install
npm run dev
```

- Lint: `npm run lint`
- Build: `npm run build`
- Preview production build: `npm run preview`

## Docker

A multi-stage Dockerfile is provided to compile the Vite app and serve the static bundle through NGINX.

```bash
# Build the image
npm run docker:build

# Run the image (serves on http://localhost:4173)
npm run docker:run
```

The `nginx.conf` file rewrites all unmatched routes to `index.html`, so the React Router SPA works when refreshing deep links.
