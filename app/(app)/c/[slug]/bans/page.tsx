import React from "react";
import { currentUser } from "@clerk/nextjs/server";
import { getSubredditBySlug } from "@/sanity/lib/subreddit/getSubredditBySlug";
import { CommunityBans } from "@/components/subreddit/CommunityBans";
import { AlertCircle, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface BansPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BansPage({ params }: BansPageProps) {
  const { slug } = await params;

  const user = await currentUser();
  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="bg-card rounded-lg border border-border p-8 text-center">
          <AlertCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <h1 className="text-lg font-semibold text-foreground">
            Authentication Required
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Please sign in to access community ban management.
          </p>
        </div>
      </div>
    );
  }

  const community = await getSubredditBySlug(slug);
  if (!community) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="bg-card rounded-lg border border-border p-8 text-center">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <h1 className="text-lg font-semibold text-foreground">
            Community Not Found
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            The community you're looking for doesn't exist.
          </p>
          <Link href="/" className="mt-4 inline-block">
            <Button variant="outline">Go to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isModerator = user && community.moderator?._id === user.id;

  if (!isModerator) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="bg-card rounded-lg border border-border p-8 text-center">
          <AlertCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <h1 className="text-lg font-semibold text-foreground">
            Access Denied
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Only community moderators can manage bans.
          </p>
          <Link href={`/c/${slug}`} className="mt-4 inline-block">
            <Button variant="outline">Back to Community</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Map banned users from community data
  const bannedUsers = (community.bannedUsers || []).map((ban: any) => ({
    userId: ban.userId || "",
    username: ban.username || "Unknown User",
    reason: ban.banReason || "",
    bannedAt: ban.bannedAt || new Date().toISOString(),
    banDuration: ban.isPermanent ? "permanent" : "temporary",
    banExpiresAt: ban.banExpiresAt,
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-card border-b border-border sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center gap-4">
            <Ban className="w-6 h-6 text-red-600" />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">
                Banned Users
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                c/{community.title} • Manage community bans
              </p>
            </div>
            <Link href={`/c/${slug}/settings`}>
              <Button variant="outline">Settings</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4">
          <CommunityBans
            subredditId={community._id}
            bannedUsers={bannedUsers}
            userRole="admin"
          />
        </div>
      </section>

      {/* Info Section */}
      <section className="py-8 border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card rounded-lg border border-border p-4">
              <h3 className="font-semibold text-foreground mb-2">
                Ban Types
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-600 mt-1.5 flex-shrink-0" />
                  <span>
                    <strong className="text-foreground">Permanent:</strong> User cannot rejoin
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-600 mt-1.5 flex-shrink-0" />
                  <span>
                    <strong className="text-foreground">Temporary:</strong> Ban expires after set duration
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-card rounded-lg border border-border p-4">
              <h3 className="font-semibold text-foreground mb-2">
                Ban Statistics
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Bans</span>
                  <span className="text-lg font-bold text-red-600">
                    {bannedUsers.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Permanent</span>
                  <span className="text-lg font-bold text-foreground">
                    {bannedUsers.filter((b) => b.banDuration === "permanent").length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Temporary</span>
                  <span className="text-lg font-bold text-foreground">
                    {bannedUsers.filter((b) => b.banDuration === "temporary").length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
