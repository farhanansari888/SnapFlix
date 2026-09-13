import { createBrowserClient } from "@supabase/ssr";
import { env } from "../env";
import { Database } from "./types";

export function createClient() {
  const url =
    env.NEXT_PUBLIC_SUPABASE_URL?.startsWith("http") &&
    !env.NEXT_PUBLIC_SUPABASE_URL.includes("your_supabase_url")
      ? env.NEXT_PUBLIC_SUPABASE_URL
      : "https://placeholder.supabase.co";
  const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "placeholder-key";

  return createBrowserClient<Database>(url, key);
}
