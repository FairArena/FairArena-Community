"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarMenuSubButton, SidebarMenuSubItem } from "@/components/ui/sidebar";

interface SidebarSubNavItemProps {
  href: string;
  title: string;
}

export function SidebarSubNavItem({ href, title }: SidebarSubNavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton asChild isActive={isActive}>
        <Link href={href}>{title}</Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}
