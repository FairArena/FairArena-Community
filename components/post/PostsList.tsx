import { getPosts, PostSortOrder } from "@/sanity/lib/post/getPosts";
import { currentUser } from "@clerk/nextjs/server";
import Post from "./Post";
import LoadMorePosts from "./LoadMorePosts";

interface PostsListProps {
  sort?: PostSortOrder;
  paginated?: boolean;
}

async function PostsList({ sort = "new", paginated = true }: PostsListProps) {
  const limit = 10;
  const posts = (await getPosts(sort, { limit, offset: 0 })) as any[];
  const user = await currentUser();

  return (
    <>
      <div className="space-y-4">
        {posts?.map((post: any) => (
          <Post key={post._id} post={post} userId={user?.id || null} />
        ))}
      </div>

      {paginated && (
        <LoadMorePosts
          sort={sort}
          initialOffset={limit}
          limit={limit}
          userId={user?.id || null}
        />
      )}
    </>
  );
}

export default PostsList;
