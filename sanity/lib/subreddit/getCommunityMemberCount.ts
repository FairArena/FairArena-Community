import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";

const getCommunityMemberCountQuery = defineQuery(
  `count(*[_type == "membership" && subreddit._ref == $subredditId])`
);

export async function getCommunityMemberCount(subredditId: string): Promise<number> {
  const { data } = await sanityFetch({
    query: getCommunityMemberCountQuery,
    params: { subredditId },
  });
  return (data as number) || 0;
}
