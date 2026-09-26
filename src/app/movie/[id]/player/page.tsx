import { Params } from "@/types";
import { redirect } from "next/navigation";

export default async function MoviePlayerRedirect({ params }: Params<{ id: string }>) {
  const { id } = await params;
  redirect(`/watch/movie/${id}`);
}
