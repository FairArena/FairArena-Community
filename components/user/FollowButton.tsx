"use client";

import { useState } from "react";
import { toggleFollow } from "@/action/toggleFollow";
import { Button } from "../ui/button";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing: boolean;
}

export default function FollowButton({ targetUserId, initialIsFollowing }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const { isSignedIn, user } = useUser();

  if (!isSignedIn || user?.id === targetUserId) {
    return null;
  }

  const handleFollow = async () => {
    setIsLoading(true);
    try {
      const result = await toggleFollow(targetUserId);
      if (result.success) {
        setIsFollowing(result.isFollowing ?? !isFollowing);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleFollow}
      disabled={isLoading}
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      className={`rounded-full px-4 font-semibold text-xs transition-all flex items-center gap-1.5 ${
        isFollowing
          ? "border-orange-500 text-orange-500 hover:bg-orange-50/50 hover:text-orange-600"
          : "bg-orange-600 hover:bg-orange-700 text-white"
      }`}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserMinus className="w-3.5 h-3.5" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="w-3.5 h-3.5" />
          Follow
        </>
      )}
    </Button>
  );
}
