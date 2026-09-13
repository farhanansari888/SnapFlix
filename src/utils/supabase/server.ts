import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "../env";
import { Database } from "./types";

export async function createClient(admin?: boolean) {
  const cookieStore = await cookies();

  const url =
    env.NEXT_PUBLIC_SUPABASE_URL?.startsWith("http") &&
    !env.NEXT_PUBLIC_SUPABASE_URL.includes("your_supabase_url")
      ? env.NEXT_PUBLIC_SUPABASE_URL
      : "https://placeholder.supabase.co";

  const key = admin
    ? env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-admin-key"
    : env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "placeholder-key";

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch (error) {
          console.error("Failed to set cookies:", error);
        }
      },
    },
  });
}
