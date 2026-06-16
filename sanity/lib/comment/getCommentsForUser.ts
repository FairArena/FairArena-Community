import { defineQuery } from "groq";
import { sanityFetch } from "../live";

export async function getCommentsForUser(userId: string) {
  const getCommentsForUserQuery = defineQuery(`
    *[_type == "comment" && author._ref == $userId && isDeleted != true] {
      _id,
      body,
      createdAt,
      "author": author->,
      "post": post->{
        _id,
        title,
        "slug": slug.current,
        "subreddit": subreddit->{ _id, title, "slug": slug.current }
      },
      "upvotes": count(*[_type == "vote" && comment._ref == ^._id && voteType == "upvote"]),
      "downvotes": count(*[_type == "vote" && comment._ref == ^._id && voteType == "downvote"])
    } | order(createdAt desc)
  `);

  const result = await sanityFetch({
    query: getCommentsForUserQuery,
    params: { userId },
  });

  return result.data;
}
