"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import { queryClient } from "@/app/providers";
import { addToast } from "@heroui/react";

type AuthUserData = User & {
  username: string;
};

const fetchUser = async (): Promise<AuthUserData | null> => {
  let AuthUser: AuthUserData | null = null;

  const supabase = createClient();

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) return null;

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Error fetching user:", error.message);

    addToast({
      title: "Error fetching user",
      description: error.message,
      color: "danger",
    });

    return null;
  }

  if (user) {
    const { data: username } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();

    if (username) {
      AuthUser = {
        ...user,
        username: username.username,
      };
    }
  }

  return AuthUser;
};

const useSupabaseUser = () => {
  const supabase = createClient();

  const query = useQuery({
    queryKey: ["supabase-user"],
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async () => {
      queryClient.invalidateQueries({ queryKey: ["supabase-user"] });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, queryClient]);

  return query;
};

export default useSupabaseUser;
