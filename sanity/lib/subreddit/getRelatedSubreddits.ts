import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";

const getRelatedSubredditsQuery = defineQuery(
  `*[_type == "subreddit" && _id != $excludeId] | order(_createdAt desc) [0...3] {
    _id,
    title,
    description,
    "slug": slug.current,
    image,
    "memberCount": count(*[_type == "membership" && subreddit._ref == ^._id])
  }`
);

export async function getRelatedSubreddits(excludeId: string) {
  const { data } = await sanityFetch({
    query: getRelatedSubredditsQuery,
    params: { excludeId },
  });
  return data || [];
}
