import { adminClient } from "../adminClient";

export async function dispatchNotification({
  recipientId,
  senderId,
  type,
  postId,
  commentId,
}: {
  recipientId: string;
  senderId: string;
  type: "comment" | "reply" | "upvote";
  postId: string;
  commentId?: string;
}) {
  try {
    // If recipient is the same as sender, don't notify
    if (recipientId === senderId) return;

    await adminClient.create({
      _type: "notification",
      recipient: {
        _type: "reference",
        _ref: recipientId,
      },
      sender: {
        _type: "reference",
        _ref: senderId,
      },
      type,
      post: {
        _type: "reference",
        _ref: postId,
      },
      comment: commentId
        ? {
            _type: "reference",
            _ref: commentId,
          }
        : undefined,
      read: false,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}
