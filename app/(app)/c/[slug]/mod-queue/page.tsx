import React from "react";
import { currentUser } from "@clerk/nextjs/server";
import { getSubredditBySlug } from "@/sanity/lib/subreddit/getSubredditBySlug";
import { CommunityModQueue } from "@/components/subreddit/CommunityModQueue";
import { AlertCircle, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ModQueuePageProps {
  params: Promise<{ slug: string }>;
}

// Mock function to get pending posts - in real implementation this would query Sanity
async function getPendingPostsForSubreddit(subredditId: string) {
  // This is a placeholder - actual implementation would query Sanity
  return [];
}

export default async function ModQueuePage({ params }: ModQueuePageProps) {
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
            Please sign in to access the moderation queue.
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
            Only community moderators can access the moderation queue.
          </p>
          <Link href={`/c/${slug}`} className="mt-4 inline-block">
            <Button variant="outline">Back to Community</Button>
          </Link>
        </div>
      </div>
    );
  }

  const pendingPosts = await getPendingPostsForSubreddit(community._id);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-card border-b border-border sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center gap-4">
            <ClipboardList className="w-6 h-6 text-orange-600" />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">
                Moderation Queue
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                c/{community.title} • Review and moderate pending posts
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
          <CommunityModQueue
            subredditId={community._id}
            pendingPosts={pendingPosts}
            userRole="admin"
          />
        </div>
      </section>

      {/* Help Section */}
      {pendingPosts.length === 0 && (
        <section className="py-8 border-t border-border">
          <div className="mx-auto max-w-7xl px-4">
            <div className="bg-muted/50 rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Moderation Queue Empty
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                All posts in your community have been reviewed. There are no pending items.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="p-3 bg-card rounded border border-border">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-1">
                    Pending Approval
                  </p>
                  <p className="text-2xl font-bold text-foreground">0</p>
                </div>
                <div className="p-3 bg-card rounded border border-border">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-1">
                    Reports
                  </p>
                  <p className="text-2xl font-bold text-foreground">0</p>
                </div>
                <div className="p-3 bg-card rounded border border-border">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-1">
                    Banned User Posts
                  </p>
                  <p className="text-2xl font-bold text-foreground">0</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
