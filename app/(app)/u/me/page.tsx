import { getUser } from "@/sanity/lib/user/getUser";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProfileMePage() {
  const user = await getUser();

  if ("error" in user) {
    redirect("/");
  }

  if (user && user.username) {
    redirect(`/u/${user.username}`);
  }

  redirect("/");
}
