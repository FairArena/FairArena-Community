"use server";

import { auth } from "@clerk/nextjs/server";
import { adminClient } from "@/sanity/lib/adminClient";
import { getUser } from "@/sanity/lib/user/getUser";
import { revalidatePath } from "next/cache";

export async function toggleBookmark(postId: string): Promise<{ bookmarked: boolean; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { bookmarked: false, error: "Not authenticated" };
    }

    const user = await getUser();
    if ("error" in user) {
      return { bookmarked: false, error: user.error };
    }

    // Check if bookmark already exists
    const existing = await adminClient.fetch(
      `*[_type == "bookmark" && user._ref == $userId && post._ref == $postId][0]._id`,
      { userId: user._id, postId }
    );

    if (existing) {
      // Delete the bookmark
      await adminClient.delete(existing);
      revalidatePath("/saved");
      return { bookmarked: false };
    } else {
      // Create new bookmark
      await adminClient.create({
        _type: "bookmark",
        user: { _type: "reference", _ref: user._id },
        post: { _type: "reference", _ref: postId },
        savedAt: new Date().toISOString(),
      });
      revalidatePath("/saved");
      return { bookmarked: true };
    }
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    return { bookmarked: false, error: "Failed to toggle bookmark" };
  }
}
