"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Users,
  Calendar,
  FileText,
  Shield,
  Settings,
  UserPlus,
} from "lucide-react";
import Link from "next/link";

interface CommunityStatsProps {
  community: {
    _id: string;
    title: string;
    slug: string;
    _createdAt?: string;
    rules?: Array<{ title: string; description?: string }>;
    moderator?: {
      _id?: string;
      username?: string | null;
    } | null;
  };
  memberCount: number;
  isMember: boolean;
  isModerator: boolean;
  onlineCount?: number;
}

export function CommunityStats({
  community,
  memberCount,
  isMember,
  isModerator,
  onlineCount,
}: CommunityStatsProps) {
  const createdDate = community._createdAt
    ? new Date(community._createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const rulesCount = community.rules?.length || 0;

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="font-bold text-foreground">Community Stats</h3>
      </div>

      <div className="divide-y divide-border">
        {/* Member Count */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-orange-600" />
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Members
              </p>
              <p className="text-lg font-bold text-foreground">
                {memberCount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Online Count (if available) */}
        {onlineCount !== undefined && (
          <div className="p-4 flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Online
              </p>
              <p className="text-sm text-foreground font-medium">
                {onlineCount.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Creation Date */}
        {createdDate && (
          <div className="p-4 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-orange-600" />
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Created
              </p>
              <p className="text-sm text-foreground font-medium">{createdDate}</p>
            </div>
          </div>
        )}

        {/* Rules Count */}
        {rulesCount > 0 && (
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Rules
                </p>
                <p className="text-sm text-foreground font-medium">
                  {rulesCount} rule{rulesCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Moderator */}
        {community.moderator?.username && (
          <div className="p-4 flex items-center gap-3">
            <Shield className="w-5 h-5 text-orange-600" />
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Moderator
              </p>
              <Link
                href={`/u/${community.moderator.username}`}
                className="text-sm text-orange-600 hover:underline font-medium"
              >
                u/{community.moderator.username}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-border space-y-2">
        {isModerator && (
          <Link href={`/c/${community.slug}/settings`} className="block">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-orange-600 border-orange-600/30 hover:bg-orange-600/10"
            >
              <Settings className="w-4 h-4" />
              Community Settings
            </Button>
          </Link>
        )}

        {!isMember && (
          <Button className="w-full gap-2 bg-orange-600 hover:bg-orange-700 text-white">
            <UserPlus className="w-4 h-4" />
            Join Community
          </Button>
        )}
      </div>
    </div>
  );
}
