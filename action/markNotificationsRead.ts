"use server";

import { adminClient } from "@/sanity/lib/adminClient";
import { currentUser } from "@clerk/nextjs/server";

export async function markNotificationsRead(notificationIds?: string[]) {
  try {
    const user = await currentUser();
    if (!user) {
      return { error: "User not found" };
    }

    if (notificationIds && notificationIds.length > 0) {
      // Mark specific notifications as read
      const transactions = notificationIds.map((id) =>
        adminClient.patch(id).set({ read: true }).commit()
      );
      await Promise.all(transactions);
    } else {
      // Mark all notifications as read for this recipient
      const notifications = await adminClient.fetch(
        `*[_type == "notification" && recipient._ref == $userId && read == false]._id`,
        { userId: user.id }
      );

      if (notifications.length > 0) {
        const transactions = notifications.map((id: string) =>
          adminClient.patch(id).set({ read: true }).commit()
        );
        await Promise.all(transactions);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return { error: "Failed to mark notifications as read" };
  }
}
