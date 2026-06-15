"use server";

import { adminClient } from "@/sanity/lib/adminClient";
import { getUser } from "@/sanity/lib/user/getUser";

export async function updateCommunity({
  subredditId,
  title,
  description,
  imageBase64,
  imageFilename,
  imageContentType,
  removeImage,
}: {
  subredditId: string;
  title: string;
  description?: string;
  imageBase64?: string | null;
  imageFilename?: string | null;
  imageContentType?: string | null;
  removeImage?: boolean;
}) {
  try {
    const user = await getUser();
    if ("error" in user) {
      return { error: user.error };
    }

    // Fetch subreddit to verify moderator
    const subreddit = await adminClient.getDocument(subredditId);
    if (!subreddit) {
      return { error: "Subreddit not found" };
    }

    if (subreddit.moderator?._ref !== user._id) {
      return { error: "You are not authorized to edit this community" };
    }

    const patch = adminClient.patch(subredditId);
    patch.set({ title, description });

    if (removeImage) {
      patch.unset(["image"]);
    } else if (imageBase64 && imageFilename && imageContentType) {
      const base64Data = imageBase64.split(",")[1];
      const buffer = Buffer.from(base64Data, "base64");
      const imageAsset = await adminClient.assets.upload("image", buffer, {
        filename: imageFilename,
        contentType: imageContentType,
      });
      patch.set({
        image: {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: imageAsset._id,
          },
        },
      });
    }

    await patch.commit();
    return { success: true };
  } catch (error) {
    console.error("Error in updateCommunity server action:", error);
    return { error: "Failed to update community settings" };
  }
}
