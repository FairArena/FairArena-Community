"use client";

import { useState, useTransition } from "react";
import { Loader2, Users } from "lucide-react";
import { toggleMembership } from "@/action/joinCommunity";

interface JoinButtonProps {
  subredditId: string;
  slug: string;
  initialIsMember: boolean;
  memberCount: number;
}

export default function JoinButton({
  subredditId,
  slug,
  initialIsMember,
  memberCount,
}: JoinButtonProps) {
  const [isMember, setIsMember] = useState(initialIsMember);
  const [count, setCount] = useState(memberCount);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const prevMember = isMember;
    const prevCount = count;

    // Optimistic update
    setIsMember(!prevMember);
    setCount(prevMember ? count - 1 : count + 1);

    startTransition(async () => {
      const result = await toggleMembership(subredditId, slug);
      if ("error" in result && result.error) {
        // Revert on error
        setIsMember(prevMember);
        setCount(prevCount);
      } else if ("isMember" in result) {
        setIsMember(!!result.isMember);
      }
    });
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1 text-sm text-gray-600">
        <Users className="w-4 h-4" />
        <span>
          {count.toLocaleString()} {count === 1 ? "member" : "members"}
        </span>
      </div>
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
          isMember
            ? "bg-white border-2 border-gray-300 text-gray-700 hover:border-red-400 hover:text-red-600"
            : "bg-orange-600 hover:bg-orange-700 text-white"
        } disabled:opacity-60 disabled:cursor-not-allowed`}
      >
        {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        {isMember ? "Joined" : "Join"}
      </button>
    </div>
  );
}
