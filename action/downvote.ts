"use server";

import { downvotePost } from "@/sanity/lib/vote/downvotePost";
import { downvoteComment } from "@/sanity/lib/vote/downvoteComment";
import { getUser } from "@/sanity/lib/user/getUser";

import { revalidatePath } from "next/cache";

export async function downvote(
  contentId: string,
  contentType: "post" | "comment" = "post"
) {
  const user = await getUser();

  if ("error" in user) {
    return { error: user.error };
  }

  try {
    if (contentType === "comment") {
      const vote = await downvoteComment(contentId, user._id);
      revalidatePath("/", "layout");
      return { vote };
    } else {
      const vote = await downvotePost(contentId, user._id);
      revalidatePath("/", "layout");
      return { vote };
    }
  } catch (err) {
    console.error("Downvote failed:", err);
    return { error: "Downvote failed" };
  }
}
