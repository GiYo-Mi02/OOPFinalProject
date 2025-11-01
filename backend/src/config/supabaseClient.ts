import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";

let supabaseClient: SupabaseClient | undefined;

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY } = env;

if (SUPABASE_URL && (SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY)) {
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY ?? SUPABASE_ANON_KEY!, {
    auth: {
      persistSession: false,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-connection-pool': 'true',
      },
    },
    // Connection pooling configuration
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
  
  console.log('✅ Supabase client initialized with connection pooling');
} else {
  console.warn("Supabase credentials are missing. API calls relying on Supabase will fail until they are configured.");
}

export const supabase = supabaseClient;
