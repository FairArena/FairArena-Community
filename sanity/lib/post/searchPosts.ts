import { defineQuery } from "groq";
import { sanityFetch } from "../live";

export async function searchPosts(query: string) {
  const searchPostsQuery = defineQuery(`
    *[_type == "post" && isDeleted != true && (title match $q + "*" || pt::text(body) match $q + "*")] {
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
    } | order(publishedAt desc) [0...20]
  `);

  const posts = await sanityFetch({
    query: searchPostsQuery,
    params: { q: query },
  });

  return posts.data || [];
}
