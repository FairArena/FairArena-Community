import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserBookmarks } from "@/sanity/lib/bookmark/getUserBookmarks";
import { getUser } from "@/sanity/lib/user/getUser";
import { Bookmark } from "lucide-react";
import Post from "@/components/post/Post";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saved Posts | FairArena",
  description: "View your saved and bookmarked posts",
};

export default async function SavedPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    redirect("/sign-in");
  }

  const sanityUser = await getUser();
  if ("error" in sanityUser) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-gray-500">Could not load saved posts. Please try again.</p>
      </div>
    );
  }

  const bookmarks = await getUserBookmarks(sanityUser._id);
  const bookmarksData = bookmarks as any;

  const validPosts = bookmarksData
    ? bookmarksData.map((b: any) => b.post).filter((p: any) => p && !p.isDeleted)
    : [];

  return (
    <>
      {/* Banner */}
      <section className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center gap-3">
            <Bookmark className="w-6 h-6 text-orange-600" />
            <div>
              <h1 className="text-2xl font-bold">Saved Posts</h1>
              <p className="text-sm text-gray-600">
                Your bookmarked posts from across communities
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="my-6">
        <div className="mx-auto max-w-3xl px-4">
          {validPosts.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-700 mb-2">No saved posts yet</h2>
              <p className="text-gray-500 text-sm">
                When you save a post, it will appear here for easy access.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {validPosts.map((post: any) => (
                <Post
                  key={post._id}
                  post={post}
                  userId={clerkUser.id}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
