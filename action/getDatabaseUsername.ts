"use server";

import { getUser } from "@/sanity/lib/user/getUser";

export async function getDatabaseUsername() {
  try {
    const user = await getUser();
    if ("error" in user) {
      return { error: user.error };
    }
    return { username: user.username };
  } catch (error) {
    console.error("Error getting database username:", error);
    return { error: "Failed to get username" };
  }
}
