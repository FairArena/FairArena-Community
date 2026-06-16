"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck, MessageSquare, ArrowUp, CornerDownRight } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getNotifications } from "@/action/getNotifications";
import { markNotificationsRead } from "@/action/markNotificationsRead";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import TimeAgo from "../TimeAgo";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const { isSignedIn } = useUser();

  const fetchNotifications = async () => {
    if (!isSignedIn) return;
    try {
      const res = await getNotifications();
      if (res.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(res.notifications.filter((n: any) => !n.read).length);
      }
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll for notifications every 30 seconds for live updates
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isSignedIn]);

  const handleMarkAllRead = async () => {
    try {
      await markNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      await markNotificationsRead([id]);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  if (!isSignedIn) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors focus:outline-none">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 shadow-lg border border-gray-200 bg-white mr-4" align="end">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5 bg-gray-50/50 rounded-t-lg">
          <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
            Notifications
            {unreadCount > 0 && (
              <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">
                {unreadCount} new
              </span>
            )}
          </h3>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
          {notifications.length > 0 ? (
            notifications.map((n) => {
              const communitySlug =
                n.post?.subreddit?.slug?.current || n.post?.subreddit?.slug || "";
              const url = `/c/${communitySlug}/post/${n.post?._id}`;

              return (
                <div
                  key={n._id}
                  onClick={() => handleMarkSingleRead(n._id)}
                  className={`p-3 transition-colors text-left flex gap-3 hover:bg-gray-50 cursor-pointer ${
                    !n.read ? "bg-orange-50/30" : ""
                  }`}
                >
                  <div className="flex-shrink-0">
                    {n.sender?.imageUrl ? (
                      <div className="relative w-8 h-8 rounded-full overflow-hidden border">
                        <Image
                          src={n.sender.imageUrl}
                          alt={n.sender.username}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-400 text-sm">
                        {n.sender?.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-800 leading-normal">
                      <span className="font-semibold text-gray-950">u/{n.sender?.username || "Anonymous"}</span>{" "}
                      {n.type === "upvote" && (
                        <span className="inline-flex items-center gap-0.5 text-orange-600">
                          upvoted your post <ArrowUp className="w-3 h-3" />
                        </span>
                      )}
                      {n.type === "comment" && (
                        <span className="inline-flex items-center gap-0.5 text-blue-600">
                          commented <MessageSquare className="w-3 h-3" />
                        </span>
                      )}
                      {n.type === "reply" && (
                        <span className="inline-flex items-center gap-0.5 text-purple-600">
                          replied to your comment <CornerDownRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    
                    <Link
                      href={url}
                      onClick={() => setOpen(false)}
                      className="block text-xs font-medium text-gray-500 hover:text-orange-600 truncate mt-1 transition-colors"
                      title={n.post?.title}
                    >
                      "{n.post?.title}"
                    </Link>

                    {n.comment?.content && (
                      <p className="text-[11px] text-gray-500 line-clamp-1 italic mt-0.5 pl-2 border-l-2 border-gray-200">
                        {n.comment.content}
                      </p>
                    )}

                    <div className="text-[10px] text-gray-400 mt-1">
                      <TimeAgo date={new Date(n.createdAt)} />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-gray-400 text-xs italic">
              No notifications yet
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
