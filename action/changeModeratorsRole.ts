"use server";

import { currentUser } from "@clerk/nextjs/server";
import { client } from "@/sanity/lib/client";

export async function changeModeratorsRole(
  subredditId: string,
  modKey: string,
  newRole: "admin" | "moderator"
) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  // Check if requester is admin
  const subreddit = await client.fetch(`*[_type == "subreddit" && _id == $id][0]`, {
    id: subredditId,
  });

  if (!subreddit) throw new Error("Community not found");

  const isAdmin = subreddit.moderators?.some(
    (m: any) => m.user._ref === user.id && m.role === "admin"
  );

  if (!isAdmin) throw new Error("Only admins can change moderator roles");

  const result = await client
    .patch(subredditId)
    .set({ [`moderators[_key == "${modKey}"].role`]: newRole })
    .commit();

  return result;
}
