import {
  GetAllPostsQueryResult,
  GetPostsForSubredditQueryResult,
} from "@/sanity.types";
import { getPostComments } from "@/sanity/lib/vote/getPostComments";
import { getPostVotes } from "@/sanity/lib/vote/getPostVotes";
import { getUserPostVoteStatus } from "@/sanity/lib/vote/getUserPostVoteStatus";
import { getUserBookmarkStatus } from "@/sanity/lib/bookmark/getUserBookmarkStatus";
import PostCardPresenter from "./PostCardPresenter";

interface PostProps {
  post:
    | GetAllPostsQueryResult[number]
    | GetPostsForSubredditQueryResult[number];
  userId: string | null;
  isDetailPage?: boolean;
}

async function Post({ post, userId, isDetailPage = false }: PostProps) {
  const votes = await getPostVotes(post._id);
  const vote = await getUserPostVoteStatus(post._id, userId);
  const comments = await getPostComments(post._id, userId);
  const isBookmarked = await getUserBookmarkStatus(post._id, userId);

  // Pass comments if it is the detail page
  const postData = isDetailPage ? { ...post, comments } : post;

  return (
    <PostCardPresenter
      post={postData}
      userId={userId}
      votes={votes}
      userVote={vote}
      commentsCount={comments.length}
      isBookmarked={isBookmarked}
      isDetailPage={isDetailPage}
    />
  );
}

export default Post;
