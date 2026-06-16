"use client";

import {
  GetCommentRepliesQueryResult,
  GetPostCommentsQueryResult,
} from "@/sanity.types";
import { UserCircle, ChevronDown, ChevronRight } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import TimeAgo from "../TimeAgo";
import CommentReply from "./CommentReply";
import PostVoteButtons from "../post/PostVoteButtons";

function Comment({
  postId,
  comment,
  userId,
  replies: initialReplies,
}: {
  postId: string;
  comment:
    | GetPostCommentsQueryResult[number]
    | GetCommentRepliesQueryResult[number];
  userId: string | null;
  replies: any[];
}) {
  const [collapsed, setCollapsed] = useState(false);
  const userVoteStatus = comment.votes.voteStatus;
  const hasReplies = initialReplies && initialReplies.length > 0;

  return (
    <article className="py-5 border-b border-border last:border-0">
      <div className="flex gap-2">
        {/* Collapse Button */}
        {hasReplies && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors pt-1"
            aria-label={collapsed ? "Expand comment thread" : "Collapse comment thread"}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        )}

        {collapsed ? (
          <div className="flex-1 py-2 px-3 bg-muted rounded text-sm text-muted-foreground">
            [{initialReplies?.length || 0} replies]
          </div>
        ) : (
          <div className="flex-1">
            <div className="flex gap-4">
              <PostVoteButtons
                contentId={comment._id}
                votes={comment.votes}
                vote={userVoteStatus}
                contentType="comment"
              />

              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {comment.author?.imageUrl ? (
                    <div className="flex-shrink-0">
                      <Image
                        src={comment.author.imageUrl}
                        alt={`${comment.author.username}'s profile`}
                        className="w-10 h-10 rounded-full object-cover"
                        width={40}
                        height={40}
                      />
                    </div>
                  ) : (
                    <div className="flex-shrink-0">
                      <UserCircle className="w-10 h-10 text-muted-foreground" />
                    </div>
                  )}

                  <h3 className="font-medium text-foreground">
                    {comment.author?.username || "Anonymous"}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    <TimeAgo date={new Date(comment.createdAt!)} />
                  </span>
                </div>

                <p className="text-foreground leading-relaxed">{comment.content}</p>

                <CommentReply postId={postId} comment={comment} />

                {/* Comment replies - supports infinite nesting */}
                {hasReplies && (
                  <div className="mt-3 ps-2 border-s-2 border-border space-y-0">
                    {initialReplies.map((reply: any) => (
                      <Comment
                        key={reply._id}
                        postId={postId}
                        comment={reply}
                        userId={userId}
                        replies={reply.replies || []}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export default Comment;
