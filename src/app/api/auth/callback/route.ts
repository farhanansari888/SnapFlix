import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { IS_DEVELOPMENT } from "@/utils/constants";

export const GET = async (request: Request) => {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  let next = searchParams.get("next") ?? "/";
  if (!next.startsWith("/")) {
    next = "/";
  }

  if (code) {
    const supabase = await createClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Insert or ensure profile
      if (user) {
        try {
          const adminSupabase = await createClient(true);
          const { data: profile } = await adminSupabase
            .from("profiles")
            .select("username")
            .eq("id", user.id)
            .maybeSingle();

          if (!profile) {
            // Get base username from Google
            const baseUsername =
              user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User";

            // Function to generate unique username
            const generateUniqueUsername = async (base: string) => {
              let username = base.trim();
              let attempts = 0;
              const maxAttempts = 5;

              while (attempts < maxAttempts) {
                const { data: existing } = await adminSupabase
                  .from("profiles")
                  .select("username")
                  .eq("username", username)
                  .maybeSingle();

                if (!existing) {
                  return username;
                }

                const randomNum = Math.floor(1000 + Math.random() * 9000);
                username = `${base.trim()} ${randomNum}`;
                attempts++;
              }

              return `${base.trim()} ${Date.now().toString().slice(-4)}`;
            };

            const uniqueUsername = await generateUniqueUsername(baseUsername);

            const { error: profileError } = await adminSupabase.from("profiles").insert({
              id: user.id,
              username: uniqueUsername,
            });

            if (profileError) {
              console.error("Profile creation error:", profileError);
            } else {
              console.log("Profile created with username:", uniqueUsername);
            }
          }
        } catch (profileErr) {
          console.error("Error setting up profile after Google login:", profileErr);
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer

      if (IS_DEVELOPMENT) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=true`);
};
