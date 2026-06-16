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
          ? "text-orange-600 hover:text-orange-700 bg-orange-500/10 hover:bg-orange-500/20 dark:text-orange-400 dark:hover:text-orange-300"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
