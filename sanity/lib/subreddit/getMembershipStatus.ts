import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";

const getMembershipStatusQuery = defineQuery(
  `*[_type == "membership" && user._ref == $userId && subreddit._ref == $subredditId][0]{ _id }`
);

export async function getMembershipStatus(
  subredditId: string,
  userId: string | null
): Promise<boolean> {
  if (!userId) return false;
  const { data } = await sanityFetch({
    query: getMembershipStatusQuery,
    params: { userId, subredditId },
  });
  return !!data;
}
