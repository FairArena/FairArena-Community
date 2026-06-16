import { adminClient } from "../adminClient";
import { dispatchNotification } from "../notification/dispatchNotification";

interface AddCommentParams {
  content: string;
  postId: string;
  userId: string; // This should be the Sanity user document ID
  parentCommentId?: string;
}

export async function addComment({
  content,
  postId,
  parentCommentId,
  userId,
}: AddCommentParams) {
  try {
    // Create comment document
    const commentData = {
      _type: "comment",
      content,
      author: {
        _type: "reference",
        _ref: userId,
      },
      post: {
        _type: "reference",
        _ref: postId,
      },
      parentComment: parentCommentId
        ? {
            _type: "reference",
            _ref: parentCommentId,
          }
        : undefined,
      createdAt: new Date().toISOString(),
    };

    // Create the comment in Sanity
    const comment = await adminClient.create(commentData);

    // Dispatch notification
    try {
      let recipientId = "";
      if (parentCommentId) {
        const parentComment = await adminClient.getDocument(parentCommentId) as any;
        recipientId = parentComment?.author?._ref || "";
      } else {
        const post = await adminClient.getDocument(postId) as any;
        recipientId = post?.author?._ref || "";
      }

      if (recipientId && recipientId !== userId) {
        await dispatchNotification({
          recipientId,
          senderId: userId,
          type: parentCommentId ? "reply" : "comment",
          postId,
          commentId: comment._id,
        });
      }
    } catch (err) {
      console.error("Failed to dispatch comment notification:", err);
    }

    return { comment };
  } catch (error) {
    console.error("Error adding comment:", error);
    return { error: "Failed to add comment" };
  }
}
