import { Params } from "@/types";
import { redirect } from "next/navigation";

export default async function TvPlayerRedirect({
  params,
}: Params<{ id: string; season: string; episode: string }>) {
  const { id, season, episode } = await params;
  redirect(`/watch/tv/${id}/${season}/${episode}`);
}
