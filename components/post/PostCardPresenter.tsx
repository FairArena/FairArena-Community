"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageSquare, Pencil } from "lucide-react";
import TimeAgo from "../TimeAgo";
import { urlFor } from "@/sanity/lib/image";
import PostVoteButtons from "./PostVoteButtons";
import ReportButton from "../ReportButton";
import DeleteButton from "../DeleteButton";
import PostBody from "./PostBody";
import BookmarkButton from "./BookmarkButton";
import ShareButton from "./ShareButton";

interface PostCardPresenterProps {
  post: any;
  userId: string | null;
  votes: any;
  userVote: string | null;
  commentsCount: number;
  isBookmarked: boolean;
  isDetailPage?: boolean;
}

export default function PostCardPresenter({
  post,
  userId,
  votes,
  userVote,
  commentsCount,
  isBookmarked,
  isDetailPage = false,
}: PostCardPresenterProps) {
  const communitySlug =
    post.subreddit?.slug?.current ||
    post.subreddit?.slug ||
    "";
  const postDetailUrl = `/c/${communitySlug}/post/${post._id}`;

  const isOwner = userId && post.author?._id === userId;

  // Flair color mapping
  const flairColors: Record<string, string> = {
    Discussion: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    Question: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    News: "bg-green-500/10 text-green-600 dark:text-green-400",
    Announcement: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    Media: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
    Meme: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    Meta: "bg-muted text-muted-foreground",
  };

  const flair = post.flair as string | undefined;

  return (
    <article
      key={post._id}
      className="relative bg-card rounded-md shadow-sm border border-border hover:border-muted-foreground/30 transition-colors text-left"
    >
      <div className="flex">
        {/* Vote Buttons */}
        <PostVoteButtons
          contentId={post._id}
          votes={votes}
          vote={userVote}
          contentType="post"
        />

        {/* Post Content */}
        <div className="flex-1 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2 flex-wrap">
            {post.subreddit && (
              <>
                <a
                  href={`/c/${(post.subreddit as any).slug?.current ?? (post.subreddit as any).slug}`}
                  className="font-medium hover:underline text-foreground/80"
                >
                  c/{post.subreddit.title}
                </a>
                <span>•</span>
                <span>Posted by</span>
                {post.author && (
                  <a
                    href={`/u/${post.author.username}`}
                    className="hover:underline"
                  >
                    u/{post.author.username}
                  </a>
                )}
                <span>•</span>
                {post.publishedAt && (
                  <TimeAgo date={new Date(post.publishedAt)} />
                )}
              </>
            )}
          </div>

          {/* Title + Flair */}
          <div className="mb-2">
            <div className="flex items-start gap-2 flex-wrap">
              {flair && (
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${
                    flairColors[flair] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {flair}
                </span>
              )}
              <h2 className="text-base font-semibold text-foreground leading-snug">
                {isDetailPage ? (
                  post.title
                ) : (
                  <Link
                    href={postDetailUrl}
                    className="hover:text-orange-600 transition-colors"
                  >
                    {post.title}
                  </Link>
                )}
              </h2>
            </div>
          </div>

          {/* Post Body */}
          {post.body && (
            <div className="mb-3">
              <PostBody body={post.body} isDetailPage={isDetailPage} />
            </div>
          )}

          {post.image && post.image.asset?._ref && (
            <div className="relative w-full h-64 mb-3 px-2 bg-muted/30">
              <Image
                src={urlFor(post.image).url()}
                alt={post.image.alt || "Post image"}
                fill
                className="object-contain rounded-md p-2"
                unoptimized
              />
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center gap-1 flex-wrap mt-2">
            <Link
              href={postDetailUrl}
              className="flex items-center px-2 py-1.5 gap-1 text-sm text-muted-foreground hover:bg-muted rounded transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{commentsCount} Comments</span>
            </Link>

            <BookmarkButton postId={post._id} initialIsBookmarked={isBookmarked} />

            <ShareButton postId={post._id} communitySlug={communitySlug} />
          </div>


        </div>
      </div>

      {/* Buttons */}
      <div className="absolute top-2 right-2">
        <div className="flex items-center gap-2">
          {isOwner && (
            <Link
              href={`/c/${communitySlug}/post/${post._id}/edit`}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-orange-500 transition-colors mt-1"
            >
              <Pencil size={14} />
              <span className="hidden md:block">Edit</span>
            </Link>
          )}

          <ReportButton contentId={post._id} isReported={post.isReported ?? false} />

          {post.author?._id && (
            <DeleteButton
              contentOwnerId={post.author?._id}
              contentId={post._id}
              contentType="post"
            />
          )}
        </div>
      </div>
    </article>
  );
}
