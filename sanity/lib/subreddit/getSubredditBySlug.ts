import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";

export async function getSubredditBySlug(slug: string) {
  const lowerCaseSlug = slug.toLowerCase();
  const getSubredditBySlugQuery =
    defineQuery(`*[_type == "subreddit" && lower(slug.current) == $slug][0] {
      _id,
      title,
      description,
      "slug": slug.current,
      image,
      icon,
      banner,
      primaryColor,
      communityType,
      isNSFW,
      "moderator": moderator->,
      moderators,
      rules,
      bannedUsers,
      allowedFlairs,
      allowText,
      allowImages,
      allowVideos,
      allowLinks,
      postApprovalRequired,
      archiveTime,
      _createdAt,
      _updatedAt
    }`);

  const subreddit = await sanityFetch({
    query: getSubredditBySlugQuery,
    params: { slug: lowerCaseSlug },
  });

  return subreddit.data;
}
