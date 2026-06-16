import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";

export type SubredditPostSortOrder = "new" | "top" | "hot";

export async function getPostsForSubreddit(id: string, sort: SubredditPostSortOrder = "new") {
  const orderClause =
    sort === "top"
      ? "order(count(*[_type == 'vote' && post._ref == ^._id && voteType == 'upvote']) desc)"
      : sort === "hot"
        ? "order((count(*[_type == 'vote' && post._ref == ^._id]) + count(*[_type == 'comment' && post._ref == ^._id])) desc, publishedAt desc)"
        : "order(publishedAt desc)";

  const getPostsForSubredditQuery = defineQuery(`
      *[_type == "post" && subreddit._ref == $id && isDeleted != true] {
        ...,
        "slug": slug.current,
        "author": author->,
        "subreddit": subreddit->,
        "category": category->,
        isNSFW,
        isSpoiler,
        postType,
        linkUrl,
        "upvotes": count(*[_type == "vote" && post._ref == ^._id && voteType == "upvote"]),
        "downvotes": count(*[_type == "vote" && post._ref == ^._id && voteType == "downvote"]),
        "netScore": count(*[_type == "vote" && post._ref == ^._id && voteType == "upvote"]) - count(*[_type == "vote" && post._ref == ^._id && voteType == "downvote"]),
        "commentCount": count(*[_type == "comment" && post._ref == ^._id])
      } | ${orderClause} 
    `);

  const result = await sanityFetch({
    query: getPostsForSubredditQuery,
    params: { id },
  });

  return result.data;
}
