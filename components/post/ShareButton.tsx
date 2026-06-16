"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

interface ShareButtonProps {
  postId: string;
  communitySlug: string;
}

export default function ShareButton({ postId, communitySlug }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    return `${window.location.origin}/c/${communitySlug}/post/${postId}`;
  };

  const handleShare = async () => {
    const url = getShareUrl();

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this post",
          url,
        });
        return;
      } catch {
        // Fall through to clipboard copy if share is cancelled or fails
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <button
      onClick={handleShare}
      title="Share post"
      className={`flex items-center gap-1 px-2 py-1.5 rounded text-sm transition-colors ${
        copied
          ? "text-green-600 bg-green-500/10 dark:text-green-400"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
      <span className="hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
    </button>
  );
}
