import { getPosts, PostSortOrder } from "@/sanity/lib/post/getPosts";
import { currentUser } from "@clerk/nextjs/server";
import Post from "./Post";

interface PostsListProps {
  sort?: PostSortOrder;
}

async function PostsList({ sort = "new" }: PostsListProps) {
  const posts = (await getPosts(sort)) as any[];
  const user = await currentUser();

  return (
    <div className="space-y-4">
      {posts?.map((post: any) => (
        <Post key={post._id} post={post} userId={user?.id || null} />
      ))}
    </div>
  );
}

export default PostsList;
