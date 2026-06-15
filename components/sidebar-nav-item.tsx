"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SidebarMenuButton } from "@/components/ui/sidebar";

interface SidebarNavItemProps {
  href: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function SidebarNavItem({
  href,
  icon,
  children,
  className,
}: SidebarNavItemProps) {
  const pathname = usePathname();
  const isActive =
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <SidebarMenuButton asChild isActive={isActive} className={cn("p-5", className)}>
      <Link href={href}>
        {icon}
        {children}
      </Link>
    </SidebarMenuButton>
  );
}

interface SidebarSubNavItemProps {
  href: string;
  children: React.ReactNode;
}

export function SidebarSubNavItem({ href, children }: SidebarSubNavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return { href, children, isActive };
}
