import { getPostById } from "@/sanity/lib/post/getPostById";
import { getSubredditBySlug } from "@/sanity/lib/subreddit/getSubredditBySlug";
import { getMembershipStatus } from "@/sanity/lib/subreddit/getMembershipStatus";
import { getCommunityMemberCount } from "@/sanity/lib/subreddit/getCommunityMemberCount";
import { currentUser } from "@clerk/nextjs/server";
import CommunitySidebar from "@/components/CommunitySidebar";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import PostDetail from "@/components/post/PostDetail";
import SimilarPosts from "@/components/post/SimilarPosts";

interface PostPageProps {
  params: Promise<{ slug: string; postId: string }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { postId } = await params;
  const post = (await getPostById(postId)) as any;

  if (!post) return { title: "Post Not Found" };

  return {
    title: `${post.title} | FairArena`,
    description: `View this post in c/${post.subreddit?.title || "community"} on FairArena`,
    keywords: post.keywords || [],
    openGraph: {
      title: post.title || "",
      description: `View this post in c/${post.subreddit?.title || "community"} on FairArena`,
      type: "article",
    },
    twitter: {
      card: "summary",
      title: post.title || "",
    },
  };
}

export default async function PostDetailPage({ params }: PostPageProps) {
  const { slug, postId } = await params;

  const [postResult, user] = await Promise.all([
    getPostById(postId),
    currentUser(),
  ]);

  const post = postResult as any;

  if (!post || post.isDeleted) return notFound();

  // Self-healing redirect if URL slug does not match post's actual subreddit slug
  const postSubredditSlug = post.subreddit?.slug?.current || post.subreddit?.slug;
  if (postSubredditSlug && postSubredditSlug !== slug) {
    redirect(`/c/${postSubredditSlug}/post/${postId}`);
  }

  const community = await getSubredditBySlug(slug);
  if (!community) return notFound();

  const [isMember, memberCount] = await Promise.all([
    getMembershipStatus(community._id, user?.id || null),
    getCommunityMemberCount(community._id),
  ]);

  return (
    <>
      {/* Header */}
      <section className="bg-card border-b">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <Link
            href={`/c/${slug}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-orange-600 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to c/{community.title}
          </Link>
        </div>
      </section>

      {/* Two-column layout */}
      <section className="my-6">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex gap-6">
            {/* Left: Post + Comments */}
            <div className="flex-1 min-w-0">
              <Suspense
                fallback={<div className="bg-card rounded-md border border-border h-64 animate-pulse" />}
              >
                <PostDetail post={post} userId={user?.id || null} />
              </Suspense>

              <Suspense
                fallback={<div className="bg-card rounded-lg border border-border h-32 animate-pulse mt-6" />}
              >
                <SimilarPosts
                  postId={post._id}
                  flair={post.flair || null}
                  subredditId={post.subreddit?._id}
                  keywords={post.keywords || null}
                />
              </Suspense>
            </div>

            {/* Right: Community Sidebar */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <Suspense
                fallback={<div className="bg-card rounded-lg border border-border h-64 animate-pulse" />}
              >
                <CommunitySidebar
                  community={{
                    _id: community._id,
                    title: community.title,
                    description: community.description,
                    slug: community.slug,
                    moderator: community.moderator,
                    _createdAt: (community as any)._createdAt,
                    rules: community.rules || [],
                  }}
                  isMember={isMember}
                  memberCount={memberCount}
                  userId={user?.id || null}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
