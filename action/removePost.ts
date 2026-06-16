"use server";

import { currentUser } from "@clerk/nextjs/server";
import { client } from "@/sanity/lib/client";

export async function removePost(postId: string, subredditId: string, reason: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  // Check if requester is moderator
  const subreddit = await client.fetch(`*[_type == "subreddit" && _id == $id][0]`, {
    id: subredditId,
  });

  if (!subreddit) throw new Error("Community not found");

  const isMod = subreddit.moderators?.some(
    (m: any) => m.user._ref === user.id && (m.role === "admin" || m.role === "moderator")
  );

  if (!isMod) throw new Error("Only moderators can remove posts");

  const result = await client
    .patch(postId)
    .set({
      isDeleted: true,
      removedReason: reason,
      removedAt: new Date().toISOString(),
      removedBy: { _ref: user.id, _type: "reference" },
    })
    .commit();

  return result;
}
