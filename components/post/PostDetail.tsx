import { getPostVotes } from "@/sanity/lib/vote/getPostVotes";
import { getUserPostVoteStatus } from "@/sanity/lib/vote/getUserPostVoteStatus";
import { getPostComments } from "@/sanity/lib/vote/getPostComments";
import { getUserBookmarkStatus } from "@/sanity/lib/bookmark/getUserBookmarkStatus";
import TimeAgo from "../TimeAgo";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { MessageSquare, Pencil } from "lucide-react";
import CommentInput from "../comment/CommentInput";
import CommentList from "../comment/CommentList";
import PostVoteButtons from "./PostVoteButtons";
import ReportButton from "../ReportButton";
import DeleteButton from "../DeleteButton";
import PostBody from "./PostBody";
import BookmarkButton from "./BookmarkButton";
import ShareButton from "./ShareButton";
import Link from "next/link";

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
}

const flairColors: Record<string, string> = {
  Discussion: "bg-blue-100 text-blue-700",
  Question: "bg-purple-100 text-purple-700",
  News: "bg-green-100 text-green-700",
  Announcement: "bg-yellow-100 text-yellow-700",
  Media: "bg-pink-100 text-pink-700",
  Meme: "bg-orange-100 text-orange-700",
  Meta: "bg-gray-100 text-gray-700",
};

export default async function PostDetail({ post, userId }: PostDetailProps) {
  const votes = await getPostVotes(post._id);
  const vote = await getUserPostVoteStatus(post._id, userId);
  const comments = await getPostComments(post._id, userId);
  const isBookmarked = await getUserBookmarkStatus(post._id, userId);

  const communitySlug =
    (post.subreddit as any)?.slug?.current ||
    (post.subreddit as any)?.slug ||
    "";

  const isOwner = userId && post.author?._id === userId;

  return (
    <article className="bg-white rounded-md shadow-sm border border-gray-200">
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
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 flex-wrap">
            {post.subreddit && (
              <>
                <Link
                  href={`/c/${communitySlug}`}
                  className="font-medium hover:underline text-gray-700"
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

          {/* Title + Flair */}
          <div className="mb-4">
            <div className="flex items-start gap-2 flex-wrap">
              {post.flair && (
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 mt-1 ${
                    flairColors[post.flair] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {post.flair}
                </span>
              )}
              <h1 className="text-2xl font-bold text-gray-900 leading-snug">
                {post.title}
              </h1>
            </div>
          </div>

          {/* Post Body (full, no truncation) */}
          {post.body && (
            <div className="mb-4 prose prose-sm max-w-none">
              <PostBody body={post.body} isDetailPage={true} />
            </div>
          )}

          {/* Image */}
          {post.image && post.image.asset?._ref && (
            <div className="relative w-full h-80 mb-4 bg-gray-100/30">
              <Image
                src={urlFor(post.image).url()}
                alt={post.image.alt || "Post image"}
                fill
                className="object-contain rounded-md"
              />
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center gap-2 py-2 border-b border-gray-100 mb-4">
            <div className="flex items-center gap-1 text-sm text-gray-500">
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
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-orange-500 transition-colors mt-0.5"
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
          <CommentList postId={post._id} comments={comments} userId={userId} />
        </div>
      </div>
    </article>
  );
}
