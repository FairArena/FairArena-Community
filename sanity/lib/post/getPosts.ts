import { sanityFetch } from "../live";
import { defineQuery } from "groq";

export type PostSortOrder = "new" | "top" | "hot";

export async function getPosts(sort: PostSortOrder = "new") {
  const orderClause =
    sort === "top"
      ? "order(count(*[_type == 'vote' && post._ref == ^._id && voteType == 'upvote']) desc)"
      : "order(publishedAt desc)";

  const getAllPostsQuery =
    defineQuery(`*[_type == "post" && isDeleted != true] {
    _id,
    title,
    flair,
    "slug": slug.current,
    body,
    publishedAt,
    "author": author->,
    "subreddit": subreddit->,
    image,
    isDeleted,
    isReported
  } | ${orderClause}`);

  const posts = await sanityFetch({ query: getAllPostsQuery });
  return posts.data;
}
