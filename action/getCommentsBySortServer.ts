"use server";

import { getPostComments, CommentSortOrder } from "@/sanity/lib/vote/getPostComments";
import { getCommentReplies } from "@/sanity/lib/comment/getCommentReplies";

export async function getCommentsBySortServer(
  postId: string,
  userId: string | null,
  sort: CommentSortOrder
) {
  const comments = await getPostComments(postId, userId, sort);

  const commentsWithReplies = await Promise.all(
    comments.map(async (comment: any) => ({
      ...comment,
      replies: await getCommentReplies(comment._id, userId),
    }))
  );

  return commentsWithReplies;
}
