# movie-client

Next.js viewer for [reeltime.fun](https://www.reeltime.fun).

## Local development

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production deploy (GCE)

Production is **not** on Vercel. GitHub Actions builds a Docker image on push to `main` and ships it to the `movie-backend` GCE VM (Cloudflare Tunnel → `www.reeltime.fun`).

Workflow: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

Required Actions secrets on `Reeltime-Media/movie-client`:

| Secret | Purpose |
|--------|---------|
| `GCE_HOST` | VM external IP (`34.142.183.10`) |
| `GCE_USER` | SSH user with sudo |
| `GCE_SSH_KEY` | Private key for that user |
| `ALERT_RELAY_TOKEN` | Optional Telegram deploy alerts |

Manual re-run after a failed deploy:

```bash
gh run rerun <run-id> -R Reeltime-Media/movie-client --failed
```

Do not use `scripts/deploy-vercel.sh` or the parent `Deploy Frontends (Vercel)` workflow — both are retired for this app.
