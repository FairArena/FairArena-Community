import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";

const getUserBookmarkStatusQuery = defineQuery(
  `*[_type == "bookmark" && user._ref == $userId && post._ref == $postId][0]{ _id }`
);

export async function getUserBookmarkStatus(
  postId: string,
  userId: string | null
): Promise<boolean> {
  if (!userId) return false;
  const { data } = await sanityFetch({
    query: getUserBookmarkStatusQuery,
    params: { userId, postId },
  });
  return !!data;
}
