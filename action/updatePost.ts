"use server";

import { adminClient } from "@/sanity/lib/adminClient";
import { getPostById } from "@/sanity/lib/post/getPostById";
import { currentUser } from "@clerk/nextjs/server";
import { parseMarkdownToPortableText } from "@/lib/markdown";

export async function updatePost({
  postId,
  title,
  body,
  flair,
  isNSFW,
  isSpoiler,
  imageBase64,
  imageFilename,
  imageContentType,
  removeCurrentImage,
}: {
  postId: string;
  title: string;
  body?: string;
  flair?: string | null;
  isNSFW?: boolean;
  isSpoiler?: boolean;
  imageBase64?: string | null;
  imageFilename?: string | null;
  imageContentType?: string | null;
  removeCurrentImage?: boolean;
}) {
  try {
    const user = await currentUser();
    if (!user) {
      return { error: "User not found" };
    }

    const post: any = await getPostById(postId);
    if (!post) {
      return { error: "Post not found" };
    }

    if (post.author?._id !== user.id) {
      return { error: "You are not authorized to edit this post" };
    }

    const patch = adminClient.patch(postId);

    // Update title
    if (title.trim()) {
      patch.set({ title: title.trim() });
    }

    // Update body (Portable Text)
    if (body !== undefined) {
      patch.set({ body: parseMarkdownToPortableText(body) });
    }

    // Update flair
    if (flair !== undefined) {
      patch.set({ flair: flair || null });
    }

    // Update NSFW and Spoiler
    if (isNSFW !== undefined) {
      patch.set({ isNSFW });
    }
    if (isSpoiler !== undefined) {
      patch.set({ isSpoiler });
    }

    // Handle cover image
    if (removeCurrentImage) {
      patch.unset(["image"]);
      if (post.image?.asset?._ref) {
        try {
          await adminClient.delete(post.image.asset._ref);
        } catch (e) {
          console.error("Failed to delete old image asset:", e);
        }
      }
    } else if (imageBase64 && imageFilename && imageContentType) {
      try {
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

        // Try to delete old image asset if it exists
        if (post.image?.asset?._ref) {
          try {
            await adminClient.delete(post.image.asset._ref);
          } catch (e) {
            console.error("Failed to delete old image asset:", e);
          }
        }
      } catch (error) {
        console.error("Error uploading new image:", error);
      }
    }

    const result = await patch.commit();
    return { success: "Post updated successfully", post: result };
  } catch (error) {
    console.error("Error updating post:", error);
    return { error: "Failed to update post" };
  }
}
