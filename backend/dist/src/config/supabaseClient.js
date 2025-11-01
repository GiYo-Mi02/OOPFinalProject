"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("./env");
let supabaseClient;
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY } = env_1.env;
if (SUPABASE_URL && (SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY)) {
    supabaseClient = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY ?? SUPABASE_ANON_KEY, {
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
}
else {
    console.warn("Supabase credentials are missing. API calls relying on Supabase will fail until they are configured.");
}
exports.supabase = supabaseClient;
