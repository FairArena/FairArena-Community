import Post from "@/components/post/Post";
import { getPostsForUser } from "@/sanity/lib/post/getPostsForUser";
import { getUserByUsername } from "@/sanity/lib/user/getUserByUsername";
import { getUserKarma } from "@/sanity/lib/user/getUserKarma";
import { getUserFollowStats } from "@/sanity/lib/user/getUserFollowStats";
import { GetAllPostsQueryResult } from "@/sanity.types";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { Calendar, Shield, Award, Sparkles, Users } from "lucide-react";
import FollowButton from "@/components/user/FollowButton";
import EditProfileDialog from "@/components/user/EditProfileDialog";

type PostData = GetAllPostsQueryResult[number];

const bannerGradients: Record<string, string> = {
  orange: "from-orange-400 to-orange-600",
  blue: "from-blue-400 to-blue-600",
  green: "from-green-400 to-green-600",
  purple: "from-purple-400 to-purple-600",
  red: "from-red-400 to-red-600",
  slate: "from-slate-500 to-slate-700",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const user = await getUserByUsername(username);

  if (!user) {
    return {
      title: "User Not Found | FairArena",
    };
  }

  const title = `u/${user.username} - FairArena User Profile`;
  const description =
    user.bio || `Check out u/${user.username}'s posts, comments, and community contributions on FairArena.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      username: user.username,
      url: `/u/${username}`,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

async function UserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const user = await getUserByUsername(username);
  if (!user) notFound();

  const loggedInUser = await currentUser();
  const [karma, posts, followStats] = await Promise.all([
    getUserKarma(user._id),
    getPostsForUser(user._id),
    getUserFollowStats(user._id, loggedInUser?.id || null),
  ]);

  const isMe = loggedInUser && loggedInUser.id === user._id;
  const bannerColor = user.bannerColor || "orange";
  const bannerClass = bannerGradients[bannerColor] || bannerGradients.orange;

  return (
    <>
      <section className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {user.imageUrl ? (
                <div className="relative h-16 w-16 overflow-hidden rounded-full border bg-gray-100">
                  <Image
                    src={user.imageUrl}
                    alt={`${user.username}'s profile`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="relative h-16 w-16 overflow-hidden rounded-full border bg-gray-100">
                  <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-gray-400">
                    {user.username[0]?.toUpperCase()}
                  </div>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2 flex-wrap">
                  <span>{user.displayName || user.username}</span>
                  <span className="text-xs text-gray-400 font-medium px-2 py-0.5 bg-gray-100 rounded-full">
                    u/{user.username}
                  </span>
                  <Sparkles className="w-5 h-5 text-orange-500 fill-orange-100" />
                </h1>
                {user.joinedAt && (
                  <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                    <Calendar className="w-4 h-4" />
                    Joined {new Date(user.joinedAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isMe ? (
                <EditProfileDialog userProfile={user} />
              ) : (
                <FollowButton targetUserId={user._id} initialIsFollowing={followStats.isFollowing} />
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="my-6">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex gap-6">
            {/* Left: Posts */}
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                Posts by u/{user.username}
              </h2>
              <div className="flex flex-col gap-4">
                {posts.length > 0 ? (
                  posts.map((post: PostData) => (
                    <Post
                      key={post._id}
                      post={post}
                      userId={loggedInUser?.id || null}
                    />
                  ))
                ) : (
                  <div className="bg-white rounded-md p-8 text-center border border-gray-200">
                    <p className="text-gray-500">No posts yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: User Stats Sidebar */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden sticky top-4">
                <div className={`h-16 bg-gradient-to-r ${bannerClass}`}></div>
                <div className="p-4 relative">
                  <div className="absolute -top-11 left-4">
                    {user.imageUrl ? (
                      <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-white bg-gray-100 shadow-sm">
                        <Image
                          src={user.imageUrl}
                          alt={`${user.username}'s profile`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-white bg-gray-100 shadow-sm flex items-center justify-center font-bold text-gray-500 text-lg">
                        {user.username[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="mt-7">
                    <h3 className="font-bold text-gray-900 leading-snug">
                      {user.displayName || user.username}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium">u/{user.username}</p>
                    {user.bio && (
                      <p className="text-xs text-gray-600 mt-3 bg-gray-50 p-2.5 rounded border border-gray-100 italic">
                        {user.bio}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-sm font-bold text-gray-955">{karma.totalKarma}</p>
                      <p className="text-xs text-gray-400 font-medium">Karma</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-955">
                        {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString(undefined, {
                          month: "short",
                          year: "numeric"
                        }) : "N/A"}
                      </p>
                      <p className="text-xs text-gray-400 font-medium">Cake Day</p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-orange-500" />
                        Post Karma
                      </span>
                      <span className="font-semibold">{karma.postKarma}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-blue-500" />
                        Comment Karma
                      </span>
                      <span className="font-semibold">{karma.commentKarma}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t border-dashed border-gray-100">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-emerald-500" />
                        Followers
                      </span>
                      <span className="font-semibold">{followStats.followersCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-slate-500" />
                        Following
                      </span>
                      <span className="font-semibold">{followStats.followingCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default UserPage;
