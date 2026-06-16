"use server";

import { adminClient } from "@/sanity/lib/adminClient";
import { getUser } from "@/sanity/lib/user/getUser";

export async function toggleFollow(targetUserId: string) {
  try {
    const user = await getUser();
    if ("error" in user) {
      return { error: user.error };
    }

    if (user._id === targetUserId) {
      return { error: "You cannot follow yourself" };
    }

    // Fetch caller user's current following list
    const callerDoc: any = await adminClient.getDocument(user._id);
    if (!callerDoc) {
      return { error: "User profile not found in database" };
    }

    const following = callerDoc.following || [];
    const isFollowing = following.some((ref: any) => ref._ref === targetUserId);

    const patch = adminClient.patch(user._id);

    if (isFollowing) {
      // Unfollow
      const updatedFollowing = following.filter((ref: any) => ref._ref !== targetUserId);
      patch.set({ following: updatedFollowing });
    } else {
      // Follow
      patch.setIfMissing({ following: [] }).insert("after", "following[-1]", [
        {
          _type: "reference",
          _ref: targetUserId,
          _key: Math.random().toString(36).substring(2, 9),
        },
      ]);
    }

    await patch.commit();
    return { success: true, isFollowing: !isFollowing };
  } catch (error) {
    console.error("Error toggling follow status:", error);
    return { error: "Failed to update follow status" };
  }
}
