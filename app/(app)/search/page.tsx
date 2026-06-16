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
      {/* Banner */}
      <section className="bg-card border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
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
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="bg-card border-b border-border sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex gap-4">
            {["communities", "posts", "users"].map((t) => (
              <a
                key={t}
                href={`/search?query=${query}&tab=${t}`}
                className={`px-4 py-3 font-medium text-sm transition-colors ${
                  tab === t
                    ? "text-orange-600 border-b-2 border-orange-600"
                    : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="my-8">
        <div className="mx-auto max-w-7xl px-4">
          {tab === "communities" && (
            <ul className="flex flex-col gap-4">
              {subreddits.map((subreddit) => (
                <li
                  key={subreddit._id}
                  className="border border-border rounded-lg overflow-hidden"
                >
                  <Link
                    href={`/c/${subreddit.slug}`}
                    className="flex items-center cursor-pointer gap-4 py-5 px-4 hover:bg-muted transition-colors"
                  >
                    <Avatar className="h-12 w-12 border-2 border-orange-200 shadow-sm">
                      {subreddit.image && (
                        <AvatarImage
                          src={urlFor(subreddit.image).url()}
                          className="object-contain"
                        />
                      )}
                      <AvatarFallback className="text-lg font-semibold bg-orange-100 text-orange-700">
                        {subreddit.title?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h2 className="text-lg font-medium text-foreground">{subreddit.title}</h2>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {subreddit.description}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
              {subreddits.length === 0 && (
                <li className="py-8 text-center text-muted-foreground border border-border rounded-lg">
                  No communities found matching your search.
                </li>
              )}
            </ul>
          )}

          {tab === "posts" && (
            <div className="flex flex-col gap-4">
              {posts.map((post) => (
                <Post key={post._id} post={post} userId={user?.id || null} />
              ))}
              {posts.length === 0 && (
                <div className="py-8 text-center text-muted-foreground border border-border rounded-lg">
                  No posts found matching your search.
                </div>
              )}
            </div>
          )}

          {tab === "users" && (
            <ul className="flex flex-col gap-4">
              {users.map((u) => (
                <li
                  key={u._id}
                  className="border border-border rounded-lg overflow-hidden"
                >
                  <Link
                    href={`/u/${u.username}`}
                    className="flex items-center cursor-pointer gap-4 py-5 px-4 hover:bg-muted transition-colors"
                  >
                    <Avatar className="h-12 w-12 border-2 border-orange-200 shadow-sm">
                      {u.image && (
                        <AvatarImage
                          src={urlFor(u.image).url()}
                          className="object-contain"
                        />
                      )}
                      <AvatarFallback className="text-lg font-semibold bg-orange-100 text-orange-700">
                        {u.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h2 className="text-lg font-medium text-foreground">u/{u.username}</h2>
                      {u.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-1">{u.bio}</p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
              {users.length === 0 && (
                <li className="py-8 text-center text-muted-foreground border border-border rounded-lg">
                  No users found matching your search.
                </li>
              )}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}

export default SearchPage;
