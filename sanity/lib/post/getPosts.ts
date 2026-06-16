import { sanityFetch } from "../live";
import { defineQuery } from "groq";

export type PostSortOrder = "new" | "top" | "hot";

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export async function getPosts(
  sort: PostSortOrder = "new",
  options?: { limit?: number; offset?: number }
) {
  const limit = options?.limit ?? 10;
  const offset = options?.offset ?? 0;
  const start = offset;
  const end = offset + limit;

  const orderClause =
    sort === "top"
      ? "order(count(*[_type == 'vote' && post._ref == ^._id && voteType == 'upvote']) desc)"
      : sort === "hot"
        ? "order((count(*[_type == 'vote' && post._ref == ^._id]) + count(*[_type == 'comment' && post._ref == ^._id])) desc, publishedAt desc)"
        : "order(publishedAt desc)";

  const getAllPostsQuery =
    defineQuery(`*[_type == "post" && isDeleted != true] | ${orderClause} [$start...$end] {
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
    isReported,
    isNSFW,
    isSpoiler,
    postType,
    linkUrl
  }`);

  const posts = await sanityFetch({
    query: getAllPostsQuery,
    params: { start, end },
  });
  return posts.data;
}

export async function getTotalPostCount() {
  const countQuery = defineQuery(
    `count(*[_type == "post" && isDeleted != true])`
  );

  const result = await sanityFetch({ query: countQuery });
  return result.data || 0;
}
