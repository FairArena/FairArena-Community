"use server";

import { currentUser } from "@clerk/nextjs/server";
import { client } from "@/sanity/lib/client";

export async function addModerator(
  subredditId: string,
  userId: string,
  role: "admin" | "moderator"
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

  if (!isAdmin) throw new Error("Only admins can add moderators");

  const newMod = {
    _key: `mod-${Date.now()}`,
    user: { _ref: userId, _type: "reference" },
    role,
    addedAt: new Date().toISOString(),
  };

  const result = await client
    .patch(subredditId)
    .append("moderators", [newMod])
    .commit();

  return result;
}
