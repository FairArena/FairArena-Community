import Post from "@/components/post/Post";
import { getPostsForUser } from "@/sanity/lib/post/getPostsForUser";
import { getUserByUsername } from "@/sanity/lib/user/getUserByUsername";
import { GetAllPostsQueryResult } from "@/sanity.types";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type PostData = GetAllPostsQueryResult[number];

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
  const description = `Check out u/${user.username}'s posts, comments, and community contributions on FairArena.`;

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
  const posts = (await getPostsForUser(user._id)) as any;

  return (
    <>
      <section className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center gap-4">
            {user.imageUrl && (
              <div className="relative h-16 w-16 overflow-hidden rounded-full border bg-gray-100">
                <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-gray-400">
                  {user.username[0]?.toUpperCase()}
                </div>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{user.username}</h1>
              {user.joinedAt && (
                <p className="text-sm text-gray-500">
                  Joined {new Date(user.joinedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="my-8">
        <div className="mx-auto max-w-7xl px-4">
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
              <div className="bg-white rounded-md p-6 text-center">
                <p className="text-gray-500">No posts yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default UserPage;
