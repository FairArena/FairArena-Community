import { defineQuery } from "groq";
import { sanityFetch } from "../live";

export async function searchUsers(query: string) {
  const searchUsersQuery = defineQuery(`
    *[_type == "user" && (username match $q + "*" || name match $q + "*")] {
      _id,
      username,
      name,
      image,
      bio
    } [0...10]
  `);

  const users = await sanityFetch({
    query: searchUsersQuery,
    params: { q: query },
  });

  return users.data || [];
}
