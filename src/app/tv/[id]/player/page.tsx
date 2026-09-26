import { redirect } from "next/navigation";
import { Params } from "@/types";

export default async function TVPlayerRedirect({ params }: Params<{ id: string }>) {
  const { id } = await params;
  redirect(`/watch/tv/${id}/1/1`);
}
