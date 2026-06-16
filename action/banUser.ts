"use server";

import { currentUser } from "@clerk/nextjs/server";
import { client } from "@/sanity/lib/client";

interface BanUserInput {
  subredditId: string;
  userId: string;
  reason: string;
  isPermanent: boolean;
  durationDays?: number;
}

export async function banUser(input: BanUserInput) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const { subredditId, userId, reason, isPermanent, durationDays } = input;

  // Check if requester is moderator
  const subreddit = await client.fetch(`*[_type == "subreddit" && _id == $id][0]`, {
    id: subredditId,
  });

  if (!subreddit) throw new Error("Community not found");

  const isMod = subreddit.moderators?.some(
    (m: any) => m.user._ref === user.id && (m.role === "admin" || m.role === "moderator")
  );

  if (!isMod) throw new Error("Only moderators can ban users");

  const bannedAt = new Date().toISOString();
  let expiresAt = null;

  if (!isPermanent && durationDays) {
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + durationDays);
    expiresAt = expireDate.toISOString();
  }

  const newBan = {
    _key: `ban-${Date.now()}`,
    user: { _ref: userId, _type: "reference" },
    reason,
    bannedAt,
    expiresAt,
  };

  const result = await client
    .patch(subredditId)
    .append("bannedUsers", [newBan])
    .commit();

  return result;
}
