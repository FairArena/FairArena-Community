import Link from "next/link";
import Image from "next/image";
import { MessageSquare } from "lucide-react";
import TimeAgo from "../TimeAgo";
import { getSimilarPosts } from "@/sanity/lib/post/getSimilarPosts";
import { urlFor } from "@/sanity/lib/image";
import { getPostComments } from "@/sanity/lib/vote/getPostComments";

interface SimilarPostsProps {
  postId: string;
  flair: string | null;
  subredditId: string;
}

export default async function SimilarPosts({ postId, flair, subredditId }: SimilarPostsProps) {
  const posts = await getSimilarPosts(postId, flair, subredditId);

  if (!posts || posts.length === 0) {
    return null;
  }

  // Pre-fetch comments count to avoid rendering promises in JSX
  const postsWithComments = await Promise.all(
    posts.map(async (p: any) => {
      const comments = await getPostComments(p._id, null);
      return {
        ...p,
        commentsCount: comments.length,
      };
    })
  );

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

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden p-4 mt-6">
      <h3 className="font-bold text-base text-foreground mb-4 border-b border-border pb-2">
        Similar Posts
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {postsWithComments.map((p: any) => {
          const communitySlug = p.subreddit?.slug?.current || p.subreddit?.slug || "";
          const postDetailUrl = `/c/${communitySlug}/post/${p._id}`;

          return (
            <div
              key={p._id}
              className="flex flex-col border border-border rounded-md p-3 hover:border-orange-500/50 transition-colors bg-muted/30"
            >
              {/* Meta */}
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-2 flex-wrap">
                <Link href={`/c/${communitySlug}`} className="font-medium hover:underline text-foreground">
                  c/{p.subreddit?.title}
                </Link>
                <span>•</span>
                {p.publishedAt && <TimeAgo date={new Date(p.publishedAt)} />}
              </div>

              {/* Title & Flair */}
              <div className="flex-1 mb-2">
                <Link href={postDetailUrl} className="font-semibold text-sm text-foreground hover:text-orange-600 transition-colors line-clamp-2 leading-tight">
                  {p.title}
                </Link>
                {p.flair && (
                  <span
                    className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1.5 ${
                      flairColors[p.flair] || "bg-muted text-muted-foreground"
                    }`}
                  >
                    {p.flair}
                  </span>
                )}
              </div>

              {/* Image thumbnail (if exists) */}
              {p.image && p.image.asset?._ref && (
                <div className="relative w-full h-24 mb-2 bg-muted/50 rounded overflow-hidden">
                  <Image
                    src={urlFor(p.image).url()}
                    alt={p.image.alt || "Thumbnail"}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Comments count */}
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-auto pt-2 border-t border-border">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{p.commentsCount} Comments</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
