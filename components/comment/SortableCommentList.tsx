"use client";

import { useState } from "react";
import type { CommentSortOrder } from "@/sanity/lib/vote/getPostComments";
import { getCommentsBySortServer } from "@/action/getCommentsBySortServer";
import CommentSortSelector from "./CommentSortSelector";
import Comment from "./Comment";

interface SortableCommentListProps {
  postId: string;
  initialComments: any[];
  userId: string | null;
  initialSort?: CommentSortOrder;
}

export default function SortableCommentList({
  postId,
  initialComments,
  userId,
  initialSort = "best",
}: SortableCommentListProps) {
  const [comments, setComments] = useState(initialComments);
  const [currentSort, setCurrentSort] = useState<CommentSortOrder>(initialSort);
  const [isLoading, setIsLoading] = useState(false);

  const handleSortChange = async (newSort: CommentSortOrder) => {
    setCurrentSort(newSort);
    setIsLoading(true);

    try {
      const sortedComments = await getCommentsBySortServer(postId, userId, newSort);
      setComments(sortedComments);
    } catch (error) {
      console.error("Failed to load comments with new sort:", error);
      setComments(initialComments);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">
          Comments ({comments.length})
        </h2>
        <CommentSortSelector
          currentSort={currentSort}
          onSortChange={handleSortChange}
        />
      </div>

      <div className="divide-y divide-border rounded-lg bg-card border border-border">
        {isLoading ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Loading comments...</p>
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <Comment
              key={comment._id}
              postId={postId}
              comment={comment}
              userId={userId}
              replies={comment.replies || []}
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
