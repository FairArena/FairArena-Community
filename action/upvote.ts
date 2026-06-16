"use server";

import { getUser } from "@/sanity/lib/user/getUser";
import { upvoteComment } from "@/sanity/lib/vote/upvoteComment";
import { upvotePost } from "@/sanity/lib/vote/upvotePost";

import { revalidatePath } from "next/cache";

export async function upvote(
  contentId: string,
  contentType: "post" | "comment" = "post"
) {
  const user = await getUser();

  if ("error" in user) {
    return { error: user.error };
  }

  try {
    if (contentType === "comment") {
      const vote = await upvoteComment(contentId, user._id);
      revalidatePath("/", "layout");
      return { vote };
    } else {
      const vote = await upvotePost(contentId, user._id);
      revalidatePath("/", "layout");
      return { vote };
    }
  } catch (err) {
    console.error("Upvote failed:", err);
    return { error: "Upvote failed" };
  }
}
