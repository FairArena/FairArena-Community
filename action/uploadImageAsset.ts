"use server";

import { adminClient } from "@/sanity/lib/adminClient";

export async function uploadImageAsset(
  imageBase64: string,
  filename: string,
  contentType: string
) {
  try {
    const base64Data = imageBase64.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");

    const asset = await adminClient.assets.upload("image", buffer, {
      filename,
      contentType,
    });

    return {
      success: true,
      assetId: asset._id,
      url: asset.url,
    };
  } catch (error) {
    console.error("Error in uploadImageAsset server action:", error);
    return { error: "Failed to upload image" };
  }
}
