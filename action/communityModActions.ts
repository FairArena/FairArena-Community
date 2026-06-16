"use server";

import { adminClient } from "@/sanity/lib/adminClient";
import { currentUser } from "@clerk/nextjs/server";
import { getSubredditBySlug } from "@/sanity/lib/subreddit/getSubredditBySlug";

export async function removePost(subredditSlug: string, postId: string, reason: string = "") {
  try {
    const user = await currentUser();
    if (!user) {
      return { error: "User not authenticated" };
    }

    const community = await getSubredditBySlug(subredditSlug);
    if (!community) {
      return { error: "Community not found" };
    }

    // Check if user is moderator
    if (community.moderator?._id !== user.id) {
      return { error: "You are not authorized to remove posts in this community" };
    }

    const patch = adminClient.patch(postId);
    patch.set({
      isDeleted: true,
      title: "[REMOVED BY MODERATOR]",
      body: [{ children: [{ text: `[Post removed by moderator. Reason: ${reason || "No reason provided"}]` }], type: "paragraph" }]
    });

    await patch.commit();

    return { success: "Post removed successfully" };
  } catch (error) {
    console.error("Failed to remove post:", error);
    return { error: "Failed to remove post" };
  }
}

export async function lockPost(subredditSlug: string, postId: string) {
  try {
    const user = await currentUser();
    if (!user) {
      return { error: "User not authenticated" };
    }

    const community = await getSubredditBySlug(subredditSlug);
    if (!community) {
      return { error: "Community not found" };
    }

    if (community.moderator?._id !== user.id) {
      return { error: "You are not authorized to lock posts in this community" };
    }

    const patch = adminClient.patch(postId);
    patch.set({ isLocked: true });

    await patch.commit();

    return { success: "Post locked successfully" };
  } catch (error) {
    console.error("Failed to lock post:", error);
    return { error: "Failed to lock post" };
  }
}

export async function stickyPost(subredditSlug: string, postId: string, isPinned: boolean = true) {
  try {
    const user = await currentUser();
    if (!user) {
      return { error: "User not authenticated" };
    }

    const community = await getSubredditBySlug(subredditSlug);
    if (!community) {
      return { error: "Community not found" };
    }

    if (community.moderator?._id !== user.id) {
      return { error: "You are not authorized to sticky posts in this community" };
    }

    const patch = adminClient.patch(postId);
    patch.set({ isPinned });

    await patch.commit();

    return { success: `Post ${isPinned ? "pinned" : "unpinned"} successfully` };
  } catch (error) {
    console.error("Failed to sticky post:", error);
    return { error: "Failed to sticky post" };
  }
}

export async function updatePostModNotes(subredditSlug: string, postId: string, notes: string) {
  try {
    const user = await currentUser();
    if (!user) {
      return { error: "User not authenticated" };
    }

    const community = await getSubredditBySlug(subredditSlug);
    if (!community) {
      return { error: "Community not found" };
    }

    if (community.moderator?._id !== user.id) {
      return { error: "You are not authorized to edit mod notes in this community" };
    }

    const patch = adminClient.patch(postId);
    patch.set({ modNotes: notes });

    await patch.commit();

    return { success: "Mod notes updated successfully" };
  } catch (error) {
    console.error("Failed to update mod notes:", error);
    return { error: "Failed to update mod notes" };
  }
}

export async function approvePendingPost(subredditSlug: string, postId: string) {
  try {
    const user = await currentUser();
    if (!user) {
      return { error: "User not authenticated" };
    }

    const community = await getSubredditBySlug(subredditSlug);
    if (!community) {
      return { error: "Community not found" };
    }

    if (community.moderator?._id !== user.id) {
      return { error: "You are not authorized to approve posts in this community" };
    }

    const patch = adminClient.patch(postId);
    patch.set({ isApproved: true });

    await patch.commit();

    return { success: "Post approved successfully" };
  } catch (error) {
    console.error("Failed to approve post:", error);
    return { error: "Failed to approve post" };
  }
}

export async function rejectPendingPost(subredditSlug: string, postId: string, reason: string = "") {
  try {
    const user = await currentUser();
    if (!user) {
      return { error: "User not authenticated" };
    }

    const community = await getSubredditBySlug(subredditSlug);
    if (!community) {
      return { error: "Community not found" };
    }

    if (community.moderator?._id !== user.id) {
      return { error: "You are not authorized to reject posts in this community" };
    }

    const patch = adminClient.patch(postId);
    patch.set({ isApproved: false, rejectionReason: reason });

    await patch.commit();

    return { success: "Post rejected successfully" };
  } catch (error) {
    console.error("Failed to reject post:", error);
    return { error: "Failed to reject post" };
  }
}
