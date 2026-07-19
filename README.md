# UC8Phone

UC8Phone is a TanStack Start application for real browser-to-phone calls. The browser uses the Twilio Voice JavaScript SDK and Supabase authenticates users and stores call audit/history data. It is deployed as a **Cloudflare Worker** with SSR, server functions, API routes, and static assets; it is not a Pages site or a persistent Node/Vinxi server.

## Local setup

Install Node 22+, Bun 1.2.15, a Supabase project, a Twilio account with Voice enabled, and a public HTTPS URL for production webhooks.

```bash
bun install
bun run dev
```

Use a local `.env` (never commit it) for development. `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are the only browser-visible build variables. The matching `SUPABASE_URL` and `SUPABASE_ANON_KEY` values are also required at runtime by server functions.

## Cloudflare Workers deployment

The project uses the supported TanStack Start Cloudflare Vite integration (`@cloudflare/vite-plugin`) and `wrangler.jsonc`. `wrangler` deploys `@tanstack/react-start/server-entry`, including SSR, SPA fallback, API routes, and Vite-built assets. `node .output/server/index.mjs` is not a production start command.

1. Authenticate and install dependencies:

   ```bash
   bun install
   bunx wrangler login
   ```

2. In the Cloudflare dashboard, create a **Workers** application named `uc8phone` (do **not** create a Pages project). Alternatively, the first `bun run deploy` creates the Worker named in `wrangler.jsonc`.
3. Configure the runtime values below. Use **Settings → Variables and Secrets** in the Worker dashboard, or run `bunx wrangler secret put NAME` once for each value. Secrets must never be committed.

| Name | Configure as | Required value |
|---|---|---|
| `SUPABASE_URL` | Secret or encrypted Worker variable | Supabase project URL |
| `SUPABASE_ANON_KEY` | Secret or encrypted Worker variable | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** | Supabase service-role key |
| `TWILIO_ACCOUNT_SID` | **Secret** | Twilio Account SID |
| `TWILIO_API_KEY_SID` | **Secret** | Standard Twilio API Key SID |
| `TWILIO_API_KEY_SECRET` | **Secret** | Standard Twilio API Key secret |
| `TWILIO_AUTH_TOKEN` | **Secret** | Twilio Auth Token |
| `TWILIO_TWIML_APP_SID` | **Secret** | TwiML App SID |
| `TWILIO_CALLER_ID` | **Secret** | Voice-capable E.164 caller ID |
| `PUBLIC_APP_URL` | Secret or encrypted Worker variable | Exact final HTTPS origin, e.g. `https://phone.example.com` |
| `SUPPORTED_CALLING_COUNTRIES` | Worker variable | Comma-separated ISO country codes; default `US,CA,GB` |
| `BLOCKED_NUMBER_PREFIXES` | Worker variable | Comma-separated E.164 prefixes; may be empty |
| `MAX_CALL_ATTEMPTS_PER_MINUTE` | Worker variable | Positive integer; default `3` |
| `MAX_DAILY_CALL_ATTEMPTS` | Worker variable | Positive integer; default `20` |
| `MAX_DAILY_CONNECTED_MINUTES` | Worker variable | Positive integer; default `60` |
| `MAX_CONCURRENT_CALLS` | Worker variable | Positive integer; default `1` |

`nodejs_compat` is intentionally enabled in `wrangler.jsonc`: TanStack Start's Worker integration and the validated runtime configuration use the Workers `process.env` compatibility bridge. Server-side Twilio JWT and webhook verification use Web Crypto instead of the Node Twilio SDK, so Twilio credentials remain Worker-only.

4. In the Workers Build settings/CI environment (or local `.env` before `bun run build`), set these public build variables:

   ```text
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
   ```

5. Build and deploy:

   ```bash
   bun run build
   bun run deploy
   ```

   To preview the compiled Worker locally, use `bun run preview`. To generate Worker binding types after changing `wrangler.jsonc`, use `bun run cf-typegen`.

6. For a custom domain, add the domain in **Workers → uc8phone → Settings → Domains & Routes → Add → Custom Domain**. Cloudflare provisions TLS and DNS for a zone in the same account. For external DNS, create the DNS record Cloudflare displays. Then set `PUBLIC_APP_URL` to that exact `https://` origin (without a path), redeploy, and add `${PUBLIC_APP_URL}/auth` and `${PUBLIC_APP_URL}/app` to Supabase Auth redirect URLs.

7. Configure Twilio only after the final domain is live:
   * TwiML App Voice Request URL: `${PUBLIC_APP_URL}/api/twilio/voice` (POST).
   * Status callbacks: `${PUBLIC_APP_URL}/api/twilio/status` (POST).

   The webhook handlers validate Twilio's signature against `PUBLIC_APP_URL` plus the received path/query, rather than trusting forwarded-host headers. Twilio webhooks must therefore target the final HTTPS Worker/custom-domain URL exactly. Do not disable signature verification.

## Supabase setup

1. Run `supabase/migrations/202607190001_uc8phone.sql` with the SQL editor or `supabase db push`.
2. Enable email/password sign-up and configure email delivery. Configure Google OAuth in Supabase if desired.
3. RLS allows users to read their own calls and only hide their own history. Server functions authenticate the request user before using the service-role client.

## Twilio security

Create a standard Twilio API key and a TwiML App, use a Voice-capable E.164 caller ID, restrict geographic permissions to `SUPPORTED_CALLING_COUNTRIES`, and block premium/emergency prefixes with `BLOCKED_NUMBER_PREFIXES`. Browser code receives only short-lived Voice access tokens; no Twilio API secret, Auth Token, Account SID, or service-role key is exposed to Vite.

## Verification

```bash
bun run check:secrets
bun run typecheck
bun run lint
bun run test
bun run build
bunx wrangler deploy --dry-run
```

For a live smoke test, sign in, authorize the microphone, call a permitted destination, answer, verify two-way audio and mute/hangup, then confirm the signed status callback updates history.
