import { defineQuery } from "groq";
import { sanityFetch } from "../live";

export type CommentSortOrder = "best" | "new" | "top" | "controversial";

// Get all top-level comments for a post with sorting options
export async function getPostComments(
  postId: string,
  userId: string | null,
  sort: CommentSortOrder = "best"
) {
  const orderClause =
    sort === "top"
      ? "order(votes.netScore desc, createdAt desc)"
      : sort === "new"
        ? "order(createdAt desc)"
        : sort === "controversial"
          ? "order(abs(votes.upvotes - votes.downvotes) desc)"
          : "order(votes.netScore desc, createdAt desc)"; // best (default)

  const getPostCommentsQuery = defineQuery(`
    *[_type == "comment" && post._ref == $postId && !defined(parentComment)] {
        ...,
      _id,
      content,
      createdAt,
      "author": author->,
      "replies": *[_type == "comment" && parentComment._ref == ^._id],
      "votes": {
        "upvotes": count(*[_type == "vote" && comment._ref == ^._id && voteType == "upvote"]),
        "downvotes": count(*[_type == "vote" && comment._ref == ^._id && voteType == "downvote"]),
        "netScore": count(*[_type == "vote" && comment._ref == ^._id && voteType == "upvote"]) - count(*[_type == "vote" && comment._ref == ^._id && voteType == "downvote"]),
        "voteStatus": *[_type == "vote" && comment._ref == ^._id && user._ref == $userId][0].voteType,
      },
    } | ${orderClause}
  `);

  const result = await sanityFetch({
    query: getPostCommentsQuery,
    params: { postId, userId: userId || "" },
  });

  return result.data || [];
}
