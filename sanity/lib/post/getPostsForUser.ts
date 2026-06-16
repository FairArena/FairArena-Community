import { sanityFetch } from "../live";
import { defineQuery } from "groq";

export async function getPostsForUser(userId: string) {
  const getPostsForUserQuery = defineQuery(`
    *[_type == "post" && author._ref == $userId && isDeleted != true] {
      _id,
      title,
      "slug": slug.current,
      body,
      publishedAt,
      "author": author->,
      "subreddit": subreddit->,
      image,
      isDeleted,
      isReported,
      flair,
      isNSFW,
      isSpoiler,
      postType,
      linkUrl
    } | order(publishedAt desc)
  `);

  const result = await sanityFetch({
    query: getPostsForUserQuery,
    params: { userId },
  });

  return result.data;
}
