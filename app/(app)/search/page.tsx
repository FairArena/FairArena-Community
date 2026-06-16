import { searchSubreddits } from "@/sanity/lib/subreddit/searchSubreddits";
import { searchPosts } from "@/sanity/lib/post/searchPosts";
import { searchUsers } from "@/sanity/lib/user/searchUsers";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Post from "@/components/post/Post";
import { currentUser } from "@clerk/nextjs/server";

async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ query: string; tab?: string }>;
}) {
  const { query, tab = "communities" } = await searchParams;
  const user = await currentUser();

  const subreddits = await searchSubreddits(query);
  const posts = await searchPosts(query);
  const users = await searchUsers(query);

  const totalResults =
    (tab === "posts" ? posts.length : tab === "users" ? users.length : subreddits.length);

  return (
    <>
      {/* Sticky Search Header */}
      <section className="sticky top-0 z-20 bg-card border-b border-border">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Search Results ({totalResults})
          </h1>
          <p className="text-sm text-muted-foreground">
            {tab === "posts"
              ? "Posts matching "
              : tab === "users"
                ? "Users matching "
                : "Communities matching "}
            &quot;{query}&quot;
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="bg-card border-b border-border sticky top-16 z-10">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex gap-8">
            {["communities", "posts", "users"].map((t) => (
              <a
                key={t}
                href={`/search?query=${query}&tab=${t}`}
                className={`px-0 py-3 font-medium text-sm transition-colors border-b-2 ${
                  tab === t
                    ? "text-orange-600 border-b-orange-600"
                    : "text-muted-foreground hover:text-foreground border-b-transparent"
                }`}
              >
                {t === "communities" && "Communities"}
                {t === "posts" && "Posts"}
                {t === "users" && "Users"}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Results Container */}
      <section className="bg-background">
        <div className="mx-auto max-w-5xl px-4 py-6">
          {tab === "communities" && (
            <div className="space-y-3">
              {subreddits.length > 0 ? (
                subreddits.map((subreddit) => (
                  <Link
                    key={subreddit._id}
                    href={`/c/${subreddit.slug}`}
                    className="block p-4 bg-card rounded-lg border border-border hover:border-orange-400 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12 border border-border flex-shrink-0">
                        {subreddit.image && (
                          <AvatarImage
                            src={urlFor(subreddit.image).url()}
                            className="object-contain"
                          />
                        )}
                        <AvatarFallback className="font-semibold bg-orange-100 text-orange-700">
                          {subreddit.title?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-base font-semibold text-orange-600 hover:text-orange-700 mb-1">
                          c/{subreddit.title}
                        </h2>
                        {subreddit.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {subreddit.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <p className="text-base">No communities found matching &quot;{query}&quot;</p>
                </div>
              )}
            </div>
          )}

          {tab === "posts" && (
            <div className="space-y-4">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <Post key={post._id} post={post} userId={user?.id || null} />
                ))
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <p className="text-base">No posts found matching &quot;{query}&quot;</p>
                </div>
              )}
            </div>
          )}

          {tab === "users" && (
            <div className="space-y-3">
              {users.length > 0 ? (
                users.map((u) => (
                  <Link
                    key={u._id}
                    href={`/u/${u.username}`}
                    className="block p-4 bg-card rounded-lg border border-border hover:border-orange-400 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12 border border-border flex-shrink-0">
                        {u.imageUrl && (
                          <AvatarImage
                            src={u.imageUrl}
                            className="object-contain"
                          />
                        )}
                        <AvatarFallback className="font-semibold bg-orange-100 text-orange-700">
                          {u.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-base font-semibold text-orange-600 hover:text-orange-700 mb-1">
                          u/{u.username}
                        </h2>
                        {u.displayName && (
                          <p className="text-sm font-medium text-foreground mb-1">
                            {u.displayName}
                          </p>
                        )}
                        {u.bio && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {u.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <p className="text-base">No users found matching &quot;{query}&quot;</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default SearchPage;
