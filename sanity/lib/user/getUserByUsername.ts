import { sanityFetch } from "../live";
import { defineQuery } from "groq";

export async function getUserByUsername(username: string) {
  const getUserByUsernameQuery = defineQuery(
    `*[_type == "user" && username == $username][0]{
      _id,
      username,
      displayName,
      bio,
      bannerColor,
      imageUrl,
      email,
      joinedAt,
      following[]->,
      _createdAt
    }`
  );

  const result = await sanityFetch({
    query: getUserByUsernameQuery,
    params: { username },
  });

  return result.data as {
    _id: string;
    username: string;
    imageUrl?: string;
    email?: string;
    joinedAt?: string;
    displayName?: string;
    bio?: string;
    bannerColor?: string;
    following?: any[];
    _createdAt?: string;
  } | null;
}
