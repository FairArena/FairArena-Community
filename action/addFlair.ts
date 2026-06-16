"use server";

import { currentUser } from "@clerk/nextjs/server";
import { client } from "@/sanity/lib/client";

export async function addFlair(subredditId: string, flairName: string, flairColor: string) {
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

  if (!isAdmin) throw new Error("Only admins can add flairs");

  const newFlair = {
    _key: `flair-${Date.now()}`,
    name: flairName,
    color: flairColor,
  };

  const result = await client
    .patch(subredditId)
    .append("allowedFlairs", [newFlair])
    .commit();

  return result;
}
