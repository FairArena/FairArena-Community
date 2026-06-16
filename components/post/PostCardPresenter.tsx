"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageSquare, Pencil, ExternalLink } from "lucide-react";
import TimeAgo from "../TimeAgo";
import { urlFor } from "@/sanity/lib/image";
import PostVoteButtons from "./PostVoteButtons";
import ReportButton from "../ReportButton";
import DeleteButton from "../DeleteButton";
import PostBody from "./PostBody";
import BookmarkButton from "./BookmarkButton";
import ShareButton from "./ShareButton";
import MediaRevealWrapper from "./MediaRevealWrapper";

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

  let domain = "";
  if (post.postType === "link" && post.linkUrl) {
    try {
      domain = new URL(post.linkUrl).hostname.replace("www.", "");
    } catch (_) {
      domain = "link";
    }
  }

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

          {/* Title + Flair + Badges */}
          <div className="mb-2">
            <div className="flex items-start gap-2 flex-wrap mb-1">
              {flair && (
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                    flairColors[flair] || "bg-muted text-muted-foreground"
                  }`}
                >
                  {flair}
                </span>
              )}
              {post.isSpoiler && (
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-600 dark:bg-slate-700 text-white flex-shrink-0 uppercase tracking-wide">
                  Spoiler
                </span>
              )}
            </div>
            
            <h2 className="text-base font-semibold text-foreground leading-snug">
              {isDetailPage ? (
                <>
                  {post.title}
                  {domain && (
                    <span className="text-xs font-normal text-muted-foreground ml-2">
                      ({domain})
                    </span>
                  )}
                </>
              ) : (
                <Link
                  href={postDetailUrl}
                  className="hover:text-orange-600 transition-colors"
                >
                  {post.title}
                  {domain && (
                    <span className="text-xs font-normal text-muted-foreground ml-2 hover:no-underline">
                      ({domain})
                    </span>
                  )}
                </Link>
              )}
            </h2>
          </div>

          {/* Post content wrapped in MediaRevealWrapper if Spoiler */}
          <MediaRevealWrapper
            isSpoiler={post.isSpoiler}
            hasMedia={!!(post.body || post.image || (post.postType === "link" && post.linkUrl))}
          >
            {/* Post Body */}
            {post.body && (
              <div className="mb-3">
                <PostBody body={post.body} isDetailPage={isDetailPage} />
              </div>
            )}

            {/* Link Preview box */}
            {post.postType === "link" && post.linkUrl && (
              <div className="mb-3">
                <a
                  href={post.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/40 hover:bg-muted/70 transition-colors"
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-extrabold block">External Link</span>
                    <span className="text-sm font-semibold truncate block text-orange-600 dark:text-orange-400">{post.linkUrl}</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </a>
              </div>
            )}

            {/* Image */}
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
          </MediaRevealWrapper>

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
