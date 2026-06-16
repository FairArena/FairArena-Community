"use server";

import { getPosts, PostSortOrder } from "@/sanity/lib/post/getPosts";
import { getPostVotes } from "@/sanity/lib/vote/getPostVotes";
import { getUserPostVoteStatus } from "@/sanity/lib/vote/getUserPostVoteStatus";
import { getPostComments } from "@/sanity/lib/vote/getPostComments";
import { getUserBookmarkStatus } from "@/sanity/lib/bookmark/getUserBookmarkStatus";
import { currentUser } from "@clerk/nextjs/server";

export async function fetchPosts(
  sort: PostSortOrder = "new",
  options?: { limit?: number; offset?: number }
) {
  try {
    const posts = await getPosts(sort, options);
    if (!posts || !Array.isArray(posts)) {
      return { success: true, posts: [] };
    }

    const user = await currentUser();
    const userId = user?.id || null;

    // Resolve detail stats for each post on the server concurrently
    const populatedPosts = await Promise.all(
      posts.map(async (post: any) => {
        const votes = await getPostVotes(post._id);
        const vote = await getUserPostVoteStatus(post._id, userId);
        const comments = await getPostComments(post._id, userId);
        const isBookmarked = await getUserBookmarkStatus(post._id, userId);

        return {
          post,
          votes,
          userVote: vote,
          commentsCount: comments.length,
          isBookmarked,
        };
      })
    );

    return { success: true, posts: populatedPosts };
  } catch (error) {
    console.error("Error fetching posts on server:", error);
    return { error: "Failed to fetch posts" };
  }
}
