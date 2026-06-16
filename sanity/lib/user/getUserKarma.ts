import { sanityFetch } from "../live";
import { defineQuery } from "groq";

export async function getUserKarma(userId: string) {
  const getUserKarmaQuery = defineQuery(`{
    "postKarma": count(*[_type == "vote" && post->author._ref == $userId && voteType == "upvote"]) - count(*[_type == "vote" && post->author._ref == $userId && voteType == "downvote"]),
    "commentKarma": count(*[_type == "vote" && comment->author._ref == $userId && voteType == "upvote"]) - count(*[_type == "vote" && comment->author._ref == $userId && voteType == "downvote"])
  }`);

  const result = await sanityFetch({
    query: getUserKarmaQuery,
    params: { userId },
  });

  const postKarma = result.data?.postKarma || 0;
  const commentKarma = result.data?.commentKarma || 0;

  return {
    postKarma,
    commentKarma,
    totalKarma: postKarma + commentKarma,
  };
}
