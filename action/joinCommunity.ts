"use server";

import { adminClient } from "@/sanity/lib/adminClient";
import { getUser } from "@/sanity/lib/user/getUser";
import { revalidatePath } from "next/cache";

export async function toggleMembership(subredditId: string, slug: string) {
  try {
    const user = await getUser();
    if ("error" in user) return { error: user.error };

    const existing = await adminClient.fetch(
      `*[_type == "membership" && user._ref == $userId && subreddit._ref == $subredditId][0]`,
      { userId: user._id, subredditId }
    );

    if (existing) {
      await adminClient.delete(existing._id);
      revalidatePath(`/c/${slug}`);
      return { isMember: false };
    } else {
      await adminClient.create({
        _type: "membership",
        user: { _type: "reference", _ref: user._id },
        subreddit: { _type: "reference", _ref: subredditId },
        joinedAt: new Date().toISOString(),
      });
      revalidatePath(`/c/${slug}`);
      return { isMember: true };
    }
  } catch (error) {
    console.error("Error toggling membership:", error);
    return { error: "Failed to update membership" };
  }
}
