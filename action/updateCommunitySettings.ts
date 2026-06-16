"use server";

import { currentUser } from "@clerk/nextjs/server";
import { client } from "@/sanity/lib/client";

interface UpdateCommunitySettingsInput {
  subredditId: string;
  title?: string;
  description?: string;
  communityType?: "public" | "restricted" | "private";
  isNSFW?: boolean;
  primaryColor?: string;
  allowText?: boolean;
  allowImages?: boolean;
  allowVideos?: boolean;
  allowLinks?: boolean;
  postApprovalRequired?: boolean;
  archiveTime?: number;
}

export async function updateCommunitySettings(input: UpdateCommunitySettingsInput) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const { subredditId, ...updateData } = input;

  // Check if user is moderator
  const subreddit = await client.fetch(`*[_type == "subreddit" && _id == $id][0]`, {
    id: subredditId,
  });

  if (!subreddit) throw new Error("Community not found");

  const isMod = subreddit.moderators?.some(
    (m: any) => m.user._ref === user.id && (m.role === "admin" || m.role === "moderator")
  );

  if (!isMod) throw new Error("Only moderators can update settings");

  const result = await client
    .patch(subredditId)
    .set(updateData)
    .commit();

  return result;
}
