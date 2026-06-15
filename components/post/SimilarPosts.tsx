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

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden p-4 mt-6">
      <h3 className="font-bold text-base text-gray-900 mb-4 border-b border-gray-100 pb-2">
        Similar Posts
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {posts.map(async (p: any) => {
          const comments = await getPostComments(p._id, null);
          const communitySlug = p.subreddit?.slug?.current || p.subreddit?.slug || "";
          const postDetailUrl = `/c/${communitySlug}/post/${p._id}`;

          return (
            <div
              key={p._id}
              className="flex flex-col border border-gray-150 rounded-md p-3 hover:border-orange-200 transition-colors bg-gray-50/50"
            >
              {/* Meta */}
              <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-2 flex-wrap">
                <Link href={`/c/${communitySlug}`} className="font-medium hover:underline text-gray-700">
                  c/{p.subreddit?.title}
                </Link>
                <span>•</span>
                {p.publishedAt && <TimeAgo date={new Date(p.publishedAt)} />}
              </div>

              {/* Title & Flair */}
              <div className="flex-1 mb-2">
                <Link href={postDetailUrl} className="font-semibold text-sm text-gray-900 hover:text-orange-600 transition-colors line-clamp-2 leading-tight">
                  {p.title}
                </Link>
                {p.flair && (
                  <span
                    className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1.5 ${
                      flairColors[p.flair] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {p.flair}
                  </span>
                )}
              </div>

              {/* Image thumbnail (if exists) */}
              {p.image && p.image.asset?._ref && (
                <div className="relative w-full h-24 mb-2 bg-gray-100/50 rounded overflow-hidden">
                  <Image
                    src={urlFor(p.image).url()}
                    alt={p.image.alt || "Thumbnail"}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Comments count */}
              <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-auto pt-2 border-t border-gray-100">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{comments.length} Comments</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
