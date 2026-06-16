import * as React from "react";
import { BookmarkIcon, FlameIcon, HomeIcon, Minus, Plus, TrendingUpIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarRail,
} from "@/components/ui/sidebar";
import Image from "next/image";
import ReddishLogo from "@/images/Reddish Full.png";
import Link from "next/link";
import { getSubreddits } from "@/sanity/lib/subreddit/getSubreddits";
import CreateCommunityButton from "./header/CreateCommunityButton";
import { SidebarNavItem } from "./sidebar-nav-item";
import { SidebarSubNavItem } from "./sidebar-sub-nav-item";

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const subreddits = await getSubreddits();

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <Image
                  src={ReddishLogo}
                  alt="logo"
                  width={100}
                  height={100}
                  className="object-contain"
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <CreateCommunityButton />
              </SidebarMenuButton>

              <SidebarNavItem href="/" icon={<HomeIcon className="w-4 h-4 mr-2" />}>
                Home
              </SidebarNavItem>

              <SidebarNavItem href="/popular" icon={<TrendingUpIcon className="w-4 h-4 mr-2" />}>
                Popular
              </SidebarNavItem>

              <SidebarNavItem href="/hot" icon={<FlameIcon className="w-4 h-4 mr-2" />}>
                Hot/Controversial
              </SidebarNavItem>

              <SidebarNavItem href="/saved" icon={<BookmarkIcon className="w-4 h-4 mr-2" />}>
                Saved
              </SidebarNavItem>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarMenu>
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton>
                    Communities{" "}
                    <Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
                    <Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                {subreddits && subreddits.length > 0 ? (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {subreddits.map((subreddit) => (
                        <SidebarSubNavItem
                          key={subreddit._id}
                          href={`/c/${subreddit.slug}`}
                          title={subreddit.title || "unknown"}
                        />
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
