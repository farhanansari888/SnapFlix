"use client";

import { Google } from "@/utils/icons";
import { env } from "@/utils/env";
import { createClient } from "@/utils/supabase/client";
import { addToast, Button } from "@heroui/react";
import { useCallback, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          prompt: (momentListener?: (notification: any) => void) => void;
        };
      };
    };
  }
}

type GoogleLoginButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "children" | "startContent" | "onPress"
>;

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ variant = "faded", ...props }) => {
  const [loading, setLoading] = useState(false);
  const [gisLoaded, setGisLoaded] = useState(false);
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  const handleCredentialResponse = useCallback(async (response: { credential?: string }) => {
    if (!response.credential) return;

    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: response.credential,
      });

      if (error) {
        setLoading(false);
        addToast({
          title: error.message,
          color: "danger",
        });
        return;
      }

      if (data?.user) {
        // Ensure user profile in database
        try {
          const username =
            data.user.user_metadata?.full_name?.replace(/\s+/g, "_") ||
            data.user.user_metadata?.name?.replace(/\s+/g, "_") ||
            data.user.email?.split("@")[0] ||
            "User";

          await supabase.from("profiles").upsert(
            {
              id: data.user.id,
              username,
            },
            { onConflict: "id" }
          );
        } catch (profileErr) {
          console.warn("Profile creation note:", profileErr);
        }
      }

      addToast({
        title: "Successfully signed in with Google!",
        color: "success",
      });

      window.location.href = "/";
    } catch (err) {
      setLoading(false);
      console.error("Google sign in error:", err);
      addToast({
        title: err instanceof Error ? err.message : "An error occurred during Google sign in.",
        color: "danger",
      });
    }
  }, []);

  // Fallback OAuth flow if GIS native button fails
  const handleFallbackOAuth = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const redirectOrigin = typeof window !== "undefined" ? window.location.origin : "";

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${redirectOrigin}/api/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        setLoading(false);
        addToast({
          title: error.message,
          color: "danger",
        });
      } else if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      setLoading(false);
      console.error("Google login error:", error);
      addToast({
        title: error instanceof Error ? error.message : "An error occurred during Google login.",
        color: "danger",
      });
    }
  }, []);

  // Load Google Identity Services SDK
  useEffect(() => {
    const clientId = env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const scriptId = "google-jssdk";
    const initGis = () => {
      if (window.google?.accounts?.id && googleBtnContainerRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          // Render official Google button inside container
          window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            theme: "filled_black",
            size: "large",
            width: 340,
            shape: "pill",
            text: "continue_with",
            logo_alignment: "left",
          });

          setGisLoaded(true);
        } catch (e) {
          console.warn("Failed to initialize Google Identity Services:", e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGis();
      return;
    }

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initGis();
      };
      document.body.appendChild(script);
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          initGis();
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [handleCredentialResponse]);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Official Google Identity Services Button: Eliminates supabase.co domain in prompt */}
      <div
        ref={googleBtnContainerRef}
        className={`w-full flex justify-center ${gisLoaded ? "block" : "hidden"}`}
      />

      {/* Fallback Custom Button while GIS is loading or if GIS fails to render */}
      {!gisLoaded && (
        <Button
          startContent={<Google width={24} />}
          onPress={handleFallbackOAuth}
          variant={variant}
          isLoading={loading}
          className="w-full font-medium"
          {...props}
        >
          Continue with Google
        </Button>
      )}
    </div>
  );
};

export default GoogleLoginButton;
