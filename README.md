# CF Weddings — Guest Dashboard

The couple-facing guest dashboard for CF Weddings. **One Next.js app and one
Vercel project serve every wedding.** There is no tenant/hostname/slug
resolution and no login — a couple's secret key in the URL is the only thing
that identifies their wedding. This app never touches Firestore — every
read goes through the existing `guests` fetch Cloud Function over HTTP,
which looks the wedding up by key and returns its data directly.

A couple's link looks like:

```
https://guests.<their-domain>/?k=<their secret key>
```

The hostname is cosmetic — it exists so each couple can have their own
branded domain, but it drives no logic in this app. The same link works
identically on any hostname, including `localhost`.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `GUESTS_ENDPOINT_URL` | Yes | Base URL of the `guests` fetch Cloud Function. Server-only — never sent to the browser. In production: `https://us-central1-cfweddingslive.cloudfunctions.net/guests`. For local dev, point it at the bundled mock server instead (see below). |

Set it in Vercel under Project Settings → Environment Variables (Production
and Preview), and locally in `.env.local` (copy `.env.local.example`).

## Running locally

```bash
npm install
cp .env.local.example .env.local   # already points at the local mock server
npm run mock:guests                # terminal 1 — fake `guests` backend on :8787
npm run dev                        # terminal 2 — the app on :3000
```

The mock server (`scripts/mock-guests-server.mjs`) implements the same GET
contract as the real Cloud Function (`k`, `format`) and serves 250 fixture
guests split evenly across two sides. It accepts any request where
`k=dev-key`. It's dev-only — never deployed, and unrelated to production
Firestore data.

## Local dev URL

Once `npm run mock:guests` and `npm run dev` are both running:

```
http://localhost:3000/?k=dev-key
```

To test against live data instead, point `GUESTS_ENDPOINT_URL` at the real
Cloud Function and use a real couple's key:

```
http://localhost:3000/?k=<real secret key>
```

## Onboarding a new couple

Nothing in this repo needs to change — the backend issues the couple their
secret key and returns their wedding's data when it's looked up. If they
want a branded subdomain instead of the shared `dashboard.cfweddings.live`
host, attach it in Vercel:

1. In the Vercel dashboard, open this project → **Settings → Domains** →
   **Add**, and enter the couple's subdomain, e.g. `guests.example.com`.
2. Vercel will show the DNS record to create at the couple's DNS provider.
   For a subdomain like `guests.example.com` this is almost always a
   **CNAME**:
   - **Type:** `CNAME`
   - **Name/Host:** `guests` (i.e. just the subdomain label)
   - **Value/Target:** `cname.vercel-dns.com`
   (If the domain's apex is being pointed at Vercel instead, Vercel will
   show an `A` record to `76.76.21.21` — not needed for a subdomain like
   this.)
3. Add the record with the couple's DNS provider and wait for propagation
   (usually minutes, sometimes longer). Vercel's Domains page shows the
   verification status and issues the TLS certificate automatically once
   it resolves.
4. Once the domain is verified, that hostname serves the same app — the
   couple's link still works purely off their `?k=` key.
