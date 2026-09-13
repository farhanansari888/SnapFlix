import { redirect } from "next/navigation";
import { Params } from "@/types";

export default async function TVPlayerRedirect({ params }: Params<{ id: number }>) {
  const { id } = await params;
  redirect(`/tv/${id}/1/1/player`);
}
