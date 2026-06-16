import { defineQuery } from "groq";
import { sanityFetch } from "../live";

export async function getUserMemberships(userId: string) {
  const getUserMembershipsQuery = defineQuery(`
    *[_type == "membership" && user._ref == $userId] {
      "subreddit": subreddit->{
        _id,
        title,
        "slug": slug.current,
        image,
        description,
        "memberCount": count(*[_type == "membership" && subreddit._ref == ^._id])
      }
    }
  `);

  const result = await sanityFetch({
    query: getUserMembershipsQuery,
    params: { userId },
  });

  return result.data || [];
}
