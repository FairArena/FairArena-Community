"use server";

import { adminClient } from "@/sanity/lib/adminClient";
import { getUser } from "@/sanity/lib/user/getUser";

export async function updateProfile({
  displayName,
  bio,
  bannerColor,
}: {
  displayName?: string;
  bio?: string;
  bannerColor?: string;
}) {
  try {
    const user = await getUser();
    if ("error" in user) {
      return { error: user.error };
    }

    const patch = adminClient.patch(user._id);
    
    if (displayName !== undefined) {
      patch.set({ displayName: displayName.trim() || "" });
    }

    if (bio !== undefined) {
      patch.set({ bio: bio.trim() || "" });
    }

    if (bannerColor !== undefined) {
      patch.set({ bannerColor: bannerColor || "orange" });
    }

    const result = await patch.commit();
    return { success: "Profile updated successfully", user: result };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { error: "Failed to update profile" };
  }
}
