import { createClient } from '@supabase/supabase-js'
import { getRequest } from '@tanstack/react-start/server'
import { serverEnv } from './env'
export function adminSupabase() { const e=serverEnv(); return createClient(e.SUPABASE_URL,e.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}}) }
export async function requireUser() { const e=serverEnv(); const request=getRequest(); const auth=request.headers.get('authorization') ?? ''; const client=createClient(e.SUPABASE_URL,e.SUPABASE_ANON_KEY,{global:{headers:{Authorization:auth}},auth:{persistSession:false}}); const {data:{user},error}=await client.auth.getUser(); if(error || !user) throw new Error('Authentication required.'); return user }
