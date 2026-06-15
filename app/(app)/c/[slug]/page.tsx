import Post from "@/components/post/Post";
import { urlFor } from "@/sanity/lib/image";
import { getPostsForSubreddit } from "@/sanity/lib/subreddit/getPostsForSubreddit";
import { getSubredditBySlug } from "@/sanity/lib/subreddit/getSubredditBySlug";
import { getMembershipStatus } from "@/sanity/lib/subreddit/getMembershipStatus";
import { getCommunityMemberCount } from "@/sanity/lib/subreddit/getCommunityMemberCount";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import EditCommunityDialog from "@/components/subreddit/EditCommunityDialog";
import CommunitySidebar from "@/components/CommunitySidebar";
import type { Metadata } from "next";
import { Suspense } from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const community = await getSubredditBySlug(slug);

  if (!community) {
    return {
      title: "Community Not Found | FairArena",
    };
  }

  const title = `c/${community.title} - FairArena Community`;
  const description =
    community.description ||
    `Join c/${community.title} on FairArena to post, comment, vote, and discuss with community members.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `/c/${slug}`,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

async function CommunityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const community = await getSubredditBySlug(slug);
  if (!community) return null;

  const user = await currentUser();
  const posts = await getPostsForSubreddit(community._id);
  const isModerator = user && community.moderator?._id === user.id;
  const isMember = await getMembershipStatus(community._id, user?.id || null);
  const memberCount = await getCommunityMemberCount(community._id);

  return (
    <>
      {/* Community Banner */}
      <section className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {community?.image && community.image.asset?._ref && (
                <div className="relative h-16 w-16 overflow-hidden rounded-full border">
                  <Image
                    src={urlFor(community.image).url()}
                    alt={
                      community.image.alt || `${community.title} community icon`
                    }
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              )}
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{community?.title}</h1>
                  {isModerator && (
                    <EditCommunityDialog
                      subreddit={{
                        _id: community._id,
                        title: community.title || "",
                        description: community.description || "",
                        slug: community.slug || "",
                      }}
                      currentImageUrl={
                        community.image && community.image.asset?._ref
                          ? urlFor(community.image).url()
                          : null
                      }
                    />
                  )}
                </div>
                {community?.description && (
                  <p className="text-sm text-gray-600 mt-1">{community.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two-column layout: Posts + Sidebar */}
      <section className="my-6">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex gap-6">
            {/* Left: Posts */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-4">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <Post key={post._id} post={post} userId={user?.id || null} />
                  ))
                ) : (
                  <div className="bg-white rounded-md p-8 text-center border border-gray-200">
                    <p className="text-gray-500 mb-2">No posts in this community yet.</p>
                    <p className="text-sm text-gray-400">Be the first to post!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Community Sidebar */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <Suspense
                fallback={<div className="bg-white rounded-lg border border-gray-200 h-64 animate-pulse" />}
              >
                <CommunitySidebar
                  community={{
                    _id: community._id,
                    title: community.title,
                    description: community.description,
                    slug: community.slug,
                    moderator: community.moderator,
                    _createdAt: (community as any)._createdAt,
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

export default CommunityPage;
