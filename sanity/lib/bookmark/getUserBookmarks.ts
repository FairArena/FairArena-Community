import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";

const getUserBookmarksQuery = defineQuery(
  `*[_type == "bookmark" && user._ref == $userId] | order(savedAt desc) {
    _id,
    savedAt,
    "post": post-> {
      _id,
      title,
      publishedAt,
      isDeleted,
      isReported,
      flair,
      "slug": slug.current,
      "author": author->{ _id, username, imageUrl },
      "subreddit": subreddit->{ _id, title, "slug": slug.current },
      body,
      image
    }
  }`
);

export async function getUserBookmarks(userId: string) {
  const { data } = await sanityFetch({
    query: getUserBookmarksQuery,
    params: { userId },
  });
  return data || [];
}
