import { sanityFetch } from "../live";
import { defineQuery } from "groq";

export async function getUserFollowStats(userId: string, currentUserId: string | null) {
  const getStatsQuery = defineQuery(`{
    "followersCount": count(*[_type == "user" && references($userId)]),
    "followingCount": count(*[_type == "user" && _id == $userId][0].following),
    "isFollowing": count(*[_type == "user" && _id == $currentUserId && references($userId)]) > 0
  }`);

  const result = await sanityFetch({
    query: getStatsQuery,
    params: {
      userId,
      currentUserId: currentUserId || "",
    },
  });

  return {
    followersCount: result.data?.followersCount || 0,
    followingCount: result.data?.followingCount || 0,
    isFollowing: result.data?.isFollowing || false,
  };
}
