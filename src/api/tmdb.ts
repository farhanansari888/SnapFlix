import { env } from "@/utils/env";
import { TMDB } from "tmdb-ts";

const token = env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN || "placeholder_token";

export const tmdb = new TMDB(token);
