import { defineQuery } from "groq";
import { sanityFetch } from "../live";

export async function getSimilarPosts(
  postId: string,
  flair: string | null,
  subredditId: string,
  keywords: string[] | null
) {
  // We want to fetch up to 3 posts that match either:
  // 1. Overlapping keywords
  // 2. The same flair
  // 3. Belong to the same subreddit
  // excluding the current post
  const query = defineQuery(`
    *[_type == "post" && _id != $postId && isDeleted != true && (
      subreddit._ref == $subredditId || 
      (flair != null && flair == $flair) ||
      (count(keywords[@ in $keywords]) > 0)
    )] [0...3] {
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
      linkUrl,
      keywords
    } | order(publishedAt desc)
  `);

  const posts = await sanityFetch({
    query,
    params: {
      postId,
      flair: flair || "",
      subredditId,
      keywords: keywords || [],
    },
  });

  return posts.data || [];
}
