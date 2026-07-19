# UC8Phone

UC8Phone is a Node-hosted TanStack Start application for real browser-to-phone calls. The browser uses Twilio Voice JavaScript SDK WebRTC; it does **not** simulate calls or create a click-to-call bridge. Supabase authenticates users and stores call audit/history data. Twilio webhooks are the authority for final status, duration, price, and errors.

## Plan and prerequisites

The clean-replacement plan is in [PLAN.md](PLAN.md). Install Node 22+, npm, a Supabase project, a Twilio account with Voice enabled, and a public HTTPS URL (microphone and production webhooks require HTTPS).

```bash
cp .env.example .env
npm install
npm run dev
```

Environment variables used by the implementation:

| Browser-safe | Server-only |
|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `TWILIO_ACCOUNT_SID`, `TWILIO_API_KEY_SID`, `TWILIO_API_KEY_SECRET`, `TWILIO_AUTH_TOKEN`, `TWILIO_TWIML_APP_SID`, `TWILIO_CALLER_ID`, `PUBLIC_APP_URL`, `SUPPORTED_CALLING_COUNTRIES`, `BLOCKED_NUMBER_PREFIXES`, `MAX_CALL_ATTEMPTS_PER_MINUTE`, `MAX_DAILY_CALL_ATTEMPTS`, `MAX_DAILY_CONNECTED_MINUTES`, `MAX_CONCURRENT_CALLS` |

Never prefix a secret with `VITE_`. `npm run check:secrets` rejects known Twilio/service-role secret prefixes in client source.

## Supabase setup

1. Create a project and run `supabase/migrations/202607190001_uc8phone.sql` using the SQL editor or `supabase db push`.
2. Set the project URL and anon key in both matching `VITE_` variables and server variables. Put the service-role key **only** in the server environment.
3. In **Authentication → URL Configuration**, add local and production redirect URLs: `http://localhost:3000/auth`, `https://uc8phone.unrealcake8.site/auth`, and `/app` equivalents.
4. Enable email/password sign-up. Configure email delivery for password reset and confirmation.
5. For Google, create OAuth credentials at Google, add Supabase's callback URL to Google, then enable Google in Supabase Auth and add the client ID/secret there.

RLS allows users to read their own calls and only hide their own history; browser clients cannot update trusted Twilio/billing fields. Server functions authenticate the request user and use the service-role client only after that check.

## Twilio Console setup

1. Buy/configure a Voice-capable caller ID and set it as `TWILIO_CALLER_ID` in E.164 form.
2. Create a Twilio API Key (Standard) and set its SID/secret plus Account SID as server secrets.
3. Create a **TwiML App**. Set its Voice Request URL to `https://uc8phone.unrealcake8.site/api/twilio/voice`, method POST; copy the App SID to `TWILIO_TWIML_APP_SID`.
4. Set call status callback URLs to `https://uc8phone.unrealcake8.site/api/twilio/status` where required. The generated TwiML also supplies this callback.
5. Set `TWILIO_AUTH_TOKEN` only on the server. Never send it to the browser.
6. Restrict geographic permissions in Twilio to the countries listed in `SUPPORTED_CALLING_COUNTRIES`; block premium/emergency prefixes with `BLOCKED_NUMBER_PREFIXES`.

The Voice and status endpoints validate the Twilio signature against the exact public URL. Configure a reverse proxy to forward `X-Forwarded-Proto: https` and `X-Forwarded-Host: uc8phone.unrealcake8.site`; mismatch causes a deliberate 403. In local development, `PUBLIC_APP_URL` must match the URL Twilio actually reaches (typically a tunnel).

## Deploying on Node and DNS

Run `npm run build`, then `npm run start`. Deploy the generated Node server to a standard Node-compatible host; do not use a Worker/Cloudflare preset. Configure the host to send every application request to this server, preserving SPA fallback and SSR route handling. Point the DNS CNAME/A record for `uc8phone.unrealcake8.site` at the host, attach a valid TLS certificate, set `PUBLIC_APP_URL=https://uc8phone.unrealcake8.site`, and configure proxy headers above.

## Verification commands

```bash
npm run check:secrets
npm run typecheck
npm run lint
npm run test
npm run test:e2e
npm run build
npm run start
```

Tests mock the calling boundary and never place real calls. Complete a manual smoke test only with a permitted destination: sign in, authorize the microphone, dial, answer, verify two-way audio, mute/unmute, hang up, then confirm Twilio's signed status callback updates history.

## Troubleshooting

* **Microphone unavailable:** use HTTPS, grant browser permission, and ensure an input device is selected by the OS.
* **WebRTC cannot connect:** verify Twilio Voice geographic permissions, browser network access to Twilio, token API key/App SID, and caller ID.
* **Webhook 403:** check the exact Twilio URL, `PUBLIC_APP_URL`, TLS, and forwarded protocol/host; do not disable signature verification.
* **Call rejected:** use a valid E.164 destination in `SUPPORTED_CALLING_COUNTRIES` that does not match blocked prefixes or daily/rate limits.
