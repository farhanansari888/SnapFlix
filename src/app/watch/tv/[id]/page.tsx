import { Params } from "@/types";
import { redirect } from "next/navigation";
import { use } from "react";

export default function WatchTvDefaultPage({ params }: Params<{ id: string }>) {
  const { id } = use(params);
  redirect(`/watch/tv/${id}/1/1`);
}
