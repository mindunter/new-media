# Launch scout

Collects the latest startup and tech launches and writes them to `data/launches.json`,
which the Live page (`/live`) reads.

```bash
node agent/launch-scout.mjs --out public/data/launches.json
```

## Sources

| Source | Needs | Cost |
| --- | --- | --- |
| Hacker News (Show HN, Launch HN) | nothing | free |
| X recent search | `X_BEARER_TOKEN` | X bills per post read (pay per use) |

The Live page also asks Hacker News directly every minute, so it stays current between runs.

X is off until a token is set. Posts on X are found through the official API only, not by
scraping the site, which X's terms do not allow.

## Settings (environment variables)

| Name | Default | What it does |
| --- | --- | --- |
| `X_BEARER_TOKEN` | empty | Turns on X. App-only bearer token from the X developer console. |
| `X_MAX_PER_RUN` | 50 | Most posts read per run (10 to 100). |
| `X_MONTHLY_READS` | 15000 | X stops for the month at this many reads. |
| `X_DAILY_READS` | monthly / 30 | X stops for the day at this many reads, so credit lasts the whole month. |
| `X_MIN_FOLLOWERS` | 2000 | Skips accounts smaller than this. |
| `HN_MIN_POINTS` | 3 | Skips Hacker News posts below this score. |
| `KEEP_DAYS` | 7 | Launches older than this drop off. |

Each run asks X only for posts newer than the last one it saw, so reads stay close to the
number of new posts that match.

## Schedule

`.github/workflows/launch-scout.yml` runs it every 15 minutes on GitHub Actions and commits
the file to the `gh-pages` branch. On Hostinger, a cron job can run the same command and
write into `public_html/data/launches.json`.
