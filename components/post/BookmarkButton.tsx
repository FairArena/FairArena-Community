"use client";

import { useState, useTransition } from "react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { toggleBookmark } from "@/action/bookmarkPost";

interface BookmarkButtonProps {
  postId: string;
  initialIsBookmarked: boolean;
}

export default function BookmarkButton({ postId, initialIsBookmarked }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(!!initialIsBookmarked);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const prev = isBookmarked;
    setIsBookmarked(!prev); // Optimistic update

    startTransition(async () => {
      const result = await toggleBookmark(postId);
      if ("error" in result && result.error) {
        setIsBookmarked(prev); // Revert on error
      } else if ("bookmarked" in result) {
        setIsBookmarked(result.bookmarked);
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      title={isBookmarked ? "Remove bookmark" : "Save post"}
      className={`flex items-center gap-1 px-2 py-1.5 rounded text-sm transition-colors ${
        isBookmarked
          ? "text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100"
          : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
      } disabled:opacity-60 disabled:cursor-not-allowed`}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isBookmarked ? (
        <BookmarkCheck className="w-4 h-4" />
      ) : (
        <Bookmark className="w-4 h-4" />
      )}
      <span className="hidden sm:inline">{isBookmarked ? "Saved" : "Save"}</span>
    </button>
  );
}
