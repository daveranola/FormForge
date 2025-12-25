import { createServerClient } from '@supabase/ssr'
import { cookies } from "next/headers";

export function createSupaBaseClient() {
  return createServerClient(
    // Public project URL and anon key; leave RLS enforced on the server.
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Read all cookies for this request.
        async getAll() {
          const cookieStore = await cookies();
          // gets all the cookies and maps them to the format Supabase expects
          return cookieStore.getAll().map(({ name, value }) => ({ name, value }));
        },
        // Write the cookie mutations Supabase requests back to the response.
        async setAll(cookiesToSet) {
          const cookieStore = await cookies();
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set({ name, value, ...options });
            });
          } catch (error) {
            if (
              error instanceof Error &&
              error.message.includes("Cookies can only be modified")
            ) {
              return;
            }
            throw error;
          }
        },
      },
    }
  );
}
