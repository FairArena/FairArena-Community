import {
  GetAllPostsQueryResult,
  GetPostsForSubredditQueryResult,
} from "@/sanity.types";
import { getPostComments } from "@/sanity/lib/vote/getPostComments";
import { getPostVotes } from "@/sanity/lib/vote/getPostVotes";
import { getUserPostVoteStatus } from "@/sanity/lib/vote/getUserPostVoteStatus";
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
import { getUserBookmarkStatus } from "@/sanity/lib/bookmark/getUserBookmarkStatus";

interface PostProps {
  post:
    | GetAllPostsQueryResult[number]
    | GetPostsForSubredditQueryResult[number];
  userId: string | null;
  isDetailPage?: boolean;
}

async function Post({ post, userId, isDetailPage = false }: PostProps) {
  const votes = await getPostVotes(post._id);
  const vote = await getUserPostVoteStatus(post._id, userId);
  const comments = await getPostComments(post._id, userId);
  const isBookmarked = await getUserBookmarkStatus(post._id, userId);

  const communitySlug =
    (post.subreddit as any)?.slug?.current ||
    (post.subreddit as any)?.slug ||
    "";
  const postDetailUrl = `/c/${communitySlug}/post/${post._id}`;

  const isOwner = userId && post.author?._id === userId;

  // Flair color mapping
  const flairColors: Record<string, string> = {
    Discussion: "bg-blue-100 text-blue-700",
    Question: "bg-purple-100 text-purple-700",
    News: "bg-green-100 text-green-700",
    Announcement: "bg-yellow-100 text-yellow-700",
    Media: "bg-pink-100 text-pink-700",
    Meme: "bg-orange-100 text-orange-700",
    Meta: "bg-gray-100 text-gray-700",
  };

  const flair = (post as any).flair as string | undefined;

  return (
    <article
      key={post._id}
      className="relative bg-white rounded-md shadow-sm border border-gray-200 hover:border-gray-300 transition-colors"
    >
      <div className="flex">
        {/* Vote Buttons */}
        <PostVoteButtons
          contentId={post._id}
          votes={votes}
          vote={vote}
          contentType="post"
        />

        {/* Post Content */}
        <div className="flex-1 p-3">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2 flex-wrap">
            {post.subreddit && (
              <>
                <a
                  href={`/c/${(post.subreddit as any).slug?.current ?? (post.subreddit as any).slug}`}
                  className="font-medium hover:underline text-gray-700"
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
              <h2 className="text-base font-semibold text-gray-900 leading-snug">
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

          {/* Post Body - rendered client-side to avoid function-crossing boundary */}
          {post.body && (
            <div className="mb-3">
              <PostBody body={post.body} isDetailPage={isDetailPage} />
            </div>
          )}

          {post.image && post.image.asset?._ref && (
            <div className="relative w-full h-64 mb-3 px-2 bg-gray-100/30">
              <Image
                src={urlFor(post.image).url()}
                alt={post.image.alt || "Post image"}
                fill
                className="object-contain rounded-md p-2"
              />
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center gap-1 flex-wrap mt-2">
            <Link
              href={postDetailUrl}
              className="flex items-center px-2 py-1.5 gap-1 text-sm text-gray-500 hover:bg-gray-100 rounded transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{comments.length} Comments</span>
            </Link>

            <BookmarkButton postId={post._id} initialIsBookmarked={isBookmarked} />

            <ShareButton postId={post._id} communitySlug={communitySlug} />
          </div>

          {/* Comments shown only on detail page */}
          {isDetailPage && (
            <>
              <CommentInput postId={post._id} />
              <CommentList postId={post._id} comments={comments} userId={userId} />
            </>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="absolute top-2 right-2">
        <div className="flex items-center gap-2">
          {isOwner && (
            <Link
              href={`/c/${communitySlug}/post/${post._id}/edit`}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-orange-500 transition-colors mt-1"
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

export default Post;
