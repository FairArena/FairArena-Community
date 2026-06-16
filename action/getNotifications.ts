"use server";

import { adminClient } from "@/sanity/lib/adminClient";
import { currentUser } from "@clerk/nextjs/server";
import { defineQuery } from "groq";
import { sanityFetch } from "@/sanity/lib/live";

export async function getNotifications() {
  try {
    const user = await currentUser();
    if (!user) {
      return { error: "User not found" };
    }

    const query = defineQuery(`
      *[_type == "notification" && recipient._ref == $userId] | order(createdAt desc) [0...10] {
        _id,
        type,
        read,
        createdAt,
        "sender": sender-> {
          _id,
          username,
          imageUrl
        },
        "post": post-> {
          _id,
          title,
          "subreddit": subreddit-> {
            slug
          }
        },
        "comment": comment-> {
          _id,
          content
        }
      }
    `);

    const result = await sanityFetch({
      query,
      params: { userId: user.id },
    });

    return { notifications: result.data || [] };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { error: "Failed to fetch notifications" };
  }
}
