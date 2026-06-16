import {
  GetCommentRepliesQueryResult,
  GetPostCommentsQueryResult,
} from "@/sanity.types";
import Comment from "./Comment";
import { getCommentReplies } from "@/sanity/lib/comment/getCommentReplies";

async function CommentList({
  postId,
  comments,
  userId,
}: {
  postId: string;
  comments: GetPostCommentsQueryResult | GetCommentRepliesQueryResult;
  userId: string | null;
}) {
  const isRootComment = !comments.some((comment) => comment.parentComment);

  // Pre-fetch replies for all root comments
  const commentsWithReplies = await Promise.all(
    comments.map(async (comment) => ({
      ...comment,
      replies: await getCommentReplies(comment._id, userId),
    }))
  );

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between">
        {isRootComment && (
          <h2 className="text-lg font-semibold text-foreground">
            Comments ({comments.length})
          </h2>
        )}
      </div>

      <div className="divide-y divide-border rounded-lg bg-card border border-border">
        {comments.length > 0 ? (
          commentsWithReplies.map((comment) => (
            <Comment
              key={comment._id}
              postId={postId}
              comment={comment}
              userId={userId}
              replies={comment.replies}
            />
          ))
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              No comments yet. Be the first to comment!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default CommentList;
