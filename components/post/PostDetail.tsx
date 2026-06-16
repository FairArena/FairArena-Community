import { getPostVotes } from "@/sanity/lib/vote/getPostVotes";
import { getUserPostVoteStatus } from "@/sanity/lib/vote/getUserPostVoteStatus";
import { getPostComments, CommentSortOrder } from "@/sanity/lib/vote/getPostComments";
import { getUserBookmarkStatus } from "@/sanity/lib/bookmark/getUserBookmarkStatus";
import TimeAgo from "../TimeAgo";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { MessageSquare, Pencil, ExternalLink } from "lucide-react";
import CommentInput from "../comment/CommentInput";
import PostVoteButtons from "./PostVoteButtons";
import ReportButton from "../ReportButton";
import DeleteButton from "../DeleteButton";
import PostBody from "./PostBody";
import BookmarkButton from "./BookmarkButton";
import ShareButton from "./ShareButton";
import Link from "next/link";
import MediaRevealWrapper from "./MediaRevealWrapper";
import { Suspense } from "react";
import SortableCommentList from "../comment/SortableCommentList";
import { getCommentReplies } from "@/sanity/lib/comment/getCommentReplies";

async function CommentListWithRepliesAndSort({
  postId,
  comments,
  userId,
  initialSort,
}: {
  postId: string;
  comments: any[];
  userId: string | null;
  initialSort: CommentSortOrder;
}) {
  // Pre-fetch replies for all root comments
  const commentsWithReplies = await Promise.all(
    comments.map(async (comment) => ({
      ...comment,
      replies: await getCommentReplies(comment._id, userId),
    }))
  );

  return (
    <SortableCommentList
      postId={postId}
      initialComments={commentsWithReplies}
      userId={userId}
      initialSort={initialSort}
    />
  );
}

interface PostDetailProps {
  post: {
    _id: string;
    title?: string | null;
    body?: any;
    image?: any;
    publishedAt?: string | null;
    isReported?: boolean | null;
    isDeleted?: boolean | null;
    flair?: string | null;
    isNSFW?: boolean;
    isSpoiler?: boolean;
    postType?: "text" | "link";
    linkUrl?: string;
    author?: {
      _id?: string;
      username?: string | null;
      imageUrl?: string | null;
    } | null;
    subreddit?: {
      _id?: string;
      title?: string | null;
      slug?: string | null | { current?: string | null };
    } | null;
  };
  userId: string | null;
  commentSort?: CommentSortOrder;
}

const flairColors: Record<string, string> = {
  Discussion: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Question: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  News: "bg-green-500/10 text-green-600 dark:text-green-400",
  Announcement: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  Media: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  Meme: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  Meta: "bg-muted text-muted-foreground",
};

export default async function PostDetail({ post, userId, commentSort = "best" }: PostDetailProps) {
  const votes = await getPostVotes(post._id);
  const vote = await getUserPostVoteStatus(post._id, userId);
  const comments = await getPostComments(post._id, userId, commentSort);
  const isBookmarked = await getUserBookmarkStatus(post._id, userId);

  const communitySlug =
    (post.subreddit as any)?.slug?.current ||
    (post.subreddit as any)?.slug ||
    "";

  const isOwner = userId && post.author?._id === userId;

  let domain = "";
  if (post.postType === "link" && post.linkUrl) {
    try {
      domain = new URL(post.linkUrl).hostname.replace("www.", "");
    } catch (_) {
      domain = "link";
    }
  }

  return (
    <article className="bg-card rounded-md shadow-sm border border-border">
      <div className="flex">
        {/* Vote Buttons */}
        <PostVoteButtons
          contentId={post._id}
          votes={votes}
          vote={vote}
          contentType="post"
        />

        {/* Post Content */}
        <div className="flex-1 p-4">
          {/* Meta info */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 flex-wrap">
            {post.subreddit && (
              <>
                <Link
                  href={`/c/${communitySlug}`}
                  className="font-medium hover:underline text-foreground"
                >
                  c/{post.subreddit.title}
                </Link>
                <span>•</span>
                <span>Posted by</span>
                {post.author && (
                  <Link
                    href={`/u/${post.author.username}`}
                    className="hover:underline"
                  >
                    u/{post.author.username}
                  </Link>
                )}
                <span>•</span>
                {post.publishedAt && (
                  <TimeAgo date={new Date(post.publishedAt)} />
                )}
              </>
            )}
          </div>

          {/* Title + Flair + Badges */}
          <div className="mb-4">
            <div className="flex items-start gap-2 flex-wrap mb-1">
              {post.flair && (
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                    flairColors[post.flair] || "bg-muted text-muted-foreground"
                  }`}
                >
                  {post.flair}
                </span>
              )}
              {post.isSpoiler && (
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-600 dark:bg-slate-700 text-white flex-shrink-0 uppercase tracking-wide">
                  Spoiler
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-foreground leading-snug">
              {post.title}
              {domain && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({domain})
                </span>
              )}
            </h1>
            {post.keywords && post.keywords.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap mt-2">
                {post.keywords.map((kw: string) => (
                  <span key={kw} className="text-[11px] bg-muted/60 text-muted-foreground px-2 py-0.5 rounded border border-border">
                    #{kw}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Post content wrapped in MediaRevealWrapper if Spoiler */}
          <MediaRevealWrapper
            isSpoiler={post.isSpoiler}
            hasMedia={!!(post.body || post.image || (post.postType === "link" && post.linkUrl))}
          >
            {/* Post Body (full, no truncation) */}
            {post.body && (
              <div className="mb-4 prose prose-sm max-w-none">
                <PostBody body={post.body} isDetailPage={true} />
              </div>
            )}

            {/* Link Preview box */}
            {post.postType === "link" && post.linkUrl && (
              <div className="mb-4">
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
              <div className="relative w-full h-80 mb-4 bg-muted/30">
                <Image
                  src={urlFor(post.image).url()}
                  alt={post.image.alt || "Post image"}
                  fill
                  className="object-contain rounded-md"
                />
              </div>
            )}
          </MediaRevealWrapper>

          {/* Action bar */}
          <div className="flex items-center gap-2 py-2 border-b border-border mb-4">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MessageSquare className="w-4 h-4" />
              <span>{comments.length} Comments</span>
            </div>
            <BookmarkButton postId={post._id} initialIsBookmarked={isBookmarked} />
            <ShareButton postId={post._id} communitySlug={communitySlug} />
          </div>

          {/* Report/Delete/Edit */}
          <div className="flex items-center gap-3 mb-4">
            {isOwner && (
              <Link
                href={`/c/${communitySlug}/post/${post._id}/edit`}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-orange-600 transition-colors mt-0.5"
              >
                <Pencil size={14} />
                <span>Edit Post</span>
              </Link>
            )}

            <ReportButton contentId={post._id} isReported={post.isReported ?? false} />
            {post.author?._id && (
              <DeleteButton
                contentOwnerId={post.author._id}
                contentId={post._id}
                contentType="post"
              />
            )}
          </div>

          {/* Comments */}
          <CommentInput postId={post._id} />
          <Suspense
            fallback={<div className="bg-card rounded-lg border border-border h-32 animate-pulse mt-6" />}
          >
            <CommentListWithRepliesAndSort
              postId={post._id}
              comments={comments}
              userId={userId}
              initialSort={commentSort}
            />
          </Suspense>
        </div>
      </div>
    </article>
  );
}
