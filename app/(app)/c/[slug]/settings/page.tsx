import React from "react";
import { currentUser } from "@clerk/nextjs/server";
import { getSubredditBySlug } from "@/sanity/lib/subreddit/getSubredditBySlug";
import { getCommunityMemberCount } from "@/sanity/lib/subreddit/getCommunityMemberCount";
import { CommunitySettingsDialog } from "@/components/subreddit/CommunitySettingsDialog";
import {
  Settings,
  Users,
  FileText,
  Palette,
  Shield,
  Ban,
  AlertCircle,
  Users2,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CommunitySettingsPageProps {
  params: Promise<{ slug: string }>;
}

const SETTINGS_TABS = [
  {
    id: "basic",
    label: "Basic",
    icon: Settings,
    description: "Community name and description",
  },
  {
    id: "rules",
    label: "Rules",
    icon: FileText,
    description: "Community rules and guidelines",
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: Palette,
    description: "Colors and visual settings",
  },
  {
    id: "moderation",
    label: "Moderation",
    icon: Shield,
    description: "Content moderation settings",
  },
  {
    id: "bans",
    label: "Bans",
    icon: Ban,
    description: "Manage banned users",
  },
  {
    id: "moderators",
    label: "Moderators",
    icon: Users,
    description: "Manage moderators",
  },
  {
    id: "flairs",
    label: "Flairs",
    icon: AlertCircle,
    description: "Post and user flairs",
  },
  {
    id: "modqueue",
    label: "Mod Queue",
    icon: ClipboardList,
    description: "Pending posts and actions",
  },
];

export default async function CommunitySettingsPage({
  params,
}: CommunitySettingsPageProps) {
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
            Please sign in to access community settings.
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
            Only community moderators can access settings.
          </p>
          <Link href={`/c/${slug}`} className="mt-4 inline-block">
            <Button variant="outline">Back to Community</Button>
          </Link>
        </div>
      </div>
    );
  }

  const memberCount = await getCommunityMemberCount(community._id);

  const settingsData = {
    title: community.title || "",
    description: community.description || "",
    type: (community.type as "public" | "restricted" | "private") || "public",
    nsfw: community.nsfw || false,
    rules: community.rules || [],
    primaryColor: community.primaryColor || "#ea580c",
    allowImages: community.allowImages !== false,
    allowVideos: community.allowVideos !== false,
    allowText: community.allowText !== false,
    allowLinks: community.allowLinks !== false,
    archiveTime: community.archiveTime || 180,
    postApprovalRequired: community.postApprovalRequired || false,
    bannedUsers: community.bannedUsers || [],
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-card border-b border-border sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Settings className="w-6 h-6 text-orange-600" />
                c/{community.title} Settings
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your community settings and moderation tools
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Members</p>
              <p className="text-2xl font-bold text-orange-600">
                {memberCount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Settings Grid */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {SETTINGS_TABS.map((tab) => {
              const Icon = tab.icon;
              let href = "#";

              // Generate appropriate hrefs for each tab
              if (tab.id === "basic" || tab.id === "rules" || tab.id === "appearance" || tab.id === "moderation" || tab.id === "bans") {
                href = "#"; // These are handled by the dialog
              } else if (tab.id === "moderators") {
                href = `#`; // Would link to moderators page
              } else if (tab.id === "flairs") {
                href = `#`; // Would link to flairs page
              } else if (tab.id === "modqueue") {
                href = `/c/${slug}/mod-queue`;
              }

              return (
                <div
                  key={tab.id}
                  className="bg-card rounded-lg border border-border p-4 hover:border-orange-600/50 transition-colors group cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-orange-600/10 rounded-lg group-hover:bg-orange-600/20 transition-colors">
                      <Icon className="w-5 h-5 text-orange-600" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-orange-600 transition-colors">
                    {tab.label}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {tab.description}
                  </p>

                  {tab.id === "modqueue" ? (
                    <Link href={href} className="mt-3 inline-block">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-orange-600 border-orange-600/30 hover:bg-orange-600/10"
                      >
                        Go to Queue
                      </Button>
                    </Link>
                  ) : tab.id !== "moderators" && tab.id !== "flairs" ? (
                    <CommunitySettingsDialog
                      open={false}
                      onOpenChange={() => {}}
                      subredditId={community._id}
                      initialData={settingsData}
                      userRole="admin"
                    />
                  ) : (
                    <div className="mt-3 text-xs text-muted-foreground italic">
                      Coming soon
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Access Dialog Trigger */}
      <section className="py-8 border-t border-border">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-xl font-bold text-foreground mb-4">
            Edit Community Settings
          </h2>
          <div className="bg-card rounded-lg border border-border p-6">
            <p className="text-sm text-muted-foreground mb-4">
              Configure all community settings including basic information, rules, appearance, and moderation policies in one place.
            </p>
            <CommunitySettingsDialog
              open={false}
              onOpenChange={() => {}}
              subredditId={community._id}
              initialData={settingsData}
              userRole="admin"
            />
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-8 border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-xl font-bold text-foreground mb-4">
            Community Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                Members
              </p>
              <p className="text-3xl font-bold text-orange-600">
                {memberCount.toLocaleString()}
              </p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                Rules
              </p>
              <p className="text-3xl font-bold text-orange-600">
                {settingsData.rules.length}
              </p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                Community Type
              </p>
              <p className="text-lg font-bold text-foreground capitalize">
                {settingsData.type}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
