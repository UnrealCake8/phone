import { readdirSync, readFileSync } from 'node:fs'; import { join } from 'node:path';
const forbidden = /VITE_(?:TWILIO|SUPABASE_SERVICE_ROLE|API_KEY_SECRET|AUTH_TOKEN|ACCOUNT_SID|CALLER_ID)/;
function walk(dir) { for (const entry of readdirSync(dir, { withFileTypes: true })) { const path = join(dir, entry.name); if (entry.isDirectory()) walk(path); else if (/\.[cm]?[jt]sx?$/.test(path) && forbidden.test(readFileSync(path, 'utf8'))) throw new Error(`Server secret exposed to client build: ${path}`); } }
walk('src'); console.log('Client environment boundary passed.');
