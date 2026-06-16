"use server";

import { adminClient } from "@/sanity/lib/adminClient";
import { currentUser } from "@clerk/nextjs/server";
import { getSubredditBySlug } from "@/sanity/lib/subreddit/getSubredditBySlug";

export async function banUserFromCommunity(
  subredditId: string,
  userId: string,
  options: {
    reason?: string;
    durationDays?: number | null;
  }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return { error: "User not authenticated" };
    }

    const community = await adminClient.getDocument(subredditId) as any;
    if (!community) {
      return { error: "Community not found" };
    }

    if (community.moderator?._ref !== user.id) {
      return { error: "You are not authorized to ban users in this community" };
    }

    const banExpiresAt = options.durationDays
      ? new Date(Date.now() + options.durationDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const patch = adminClient.patch(community._id);
    const currentBans = community.bannedUsers || [];

    patch.set({
      bannedUsers: [
        ...currentBans,
        {
          _key: `ban_${userId}_${Date.now()}`,
          userId,
          banReason: options.reason || "No reason provided",
          bannedAt: new Date().toISOString(),
          banExpiresAt,
          isPermanent: !options.durationDays
        }
      ]
    });

    await patch.commit();

    return { success: "User banned successfully" };
  } catch (error) {
    console.error("Failed to ban user:", error);
    return { error: "Failed to ban user" };
  }
}

export async function unbanUserFromCommunity(subredditId: string, userId: string) {
  try {
    const user = await currentUser();
    if (!user) {
      return { error: "User not authenticated" };
    }

    const community = await adminClient.getDocument(subredditId) as any;
    if (!community) {
      return { error: "Community not found" };
    }

    if (community.moderator?._ref !== user.id) {
      return { error: "You are not authorized to unban users in this community" };
    }

    const currentBans = community.bannedUsers || [];
    const updatedBans = currentBans.filter((ban: any) => ban.userId !== userId);

    const patch = adminClient.patch(community._id);
    patch.set({ bannedUsers: updatedBans });

    await patch.commit();

    return { success: "User unbanned successfully" };
  } catch (error) {
    console.error("Failed to unban user:", error);
    return { error: "Failed to unban user" };
  }
}
