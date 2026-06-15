import { defineQuery } from "groq";
import { sanityFetch } from "../live";

export async function getSimilarPosts(postId: string, flair: string | null, subredditId: string) {
  // We want to fetch up to 3 posts that match either the same flair or belong to the same subreddit, excluding the current post
  const query = defineQuery(`
    *[_type == "post" && _id != $postId && isDeleted != true && (subreddit._ref == $subredditId || (flair != null && flair == $flair))] [0...3] {
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
    } | order(publishedAt desc)
  `);

  const posts = await sanityFetch({
    query,
    params: {
      postId,
      flair: flair || "",
      subredditId,
    },
  });

  return posts.data || [];
}
