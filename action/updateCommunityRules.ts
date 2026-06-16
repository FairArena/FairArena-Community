"use server";

import { currentUser } from "@clerk/nextjs/server";
import { client } from "@/sanity/lib/client";

interface Rule {
  _key?: string;
  title: string;
  description?: string;
  order: number;
}

export async function updateCommunityRules(subredditId: string, rules: Rule[]) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  // Check if user is moderator
  const subreddit = await client.fetch(`*[_type == "subreddit" && _id == $id][0]`, {
    id: subredditId,
  });

  if (!subreddit) throw new Error("Community not found");

  const isMod = subreddit.moderators?.some(
    (m: any) => m.user._ref === user.id && (m.role === "admin" || m.role === "moderator")
  );

  if (!isMod) throw new Error("Only moderators can update rules");

  const sortedRules = rules
    .sort((a, b) => a.order - b.order)
    .map((rule, idx) => ({
      ...rule,
      order: idx,
    }));

  const result = await client
    .patch(subredditId)
    .set({ rules: sortedRules })
    .commit();

  return result;
}
