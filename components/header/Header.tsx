"use client";

import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "../ui/button";
import ReddishLogo from "@/images/Reddish Full.png";
import { ChevronLeftIcon, MenuIcon, User, Search } from "lucide-react";
import Image from "next/image";
import { useSidebar } from "../ui/sidebar";
import CreatePost from "../post/CreatePost";
import NotificationBell from "./NotificationBell";
import { useEffect, useState } from "react";
import { getDatabaseUsername } from "@/action/getDatabaseUsername";
import { DarkModeToggle } from "./DarkModeToggle";
import { useRouter } from "next/navigation";
import Link from "next/link";

function Header() {
  const { toggleSidebar, open, isMobile } = useSidebar();
  const { isSignedIn, user } = useUser();
  const [dbUsername, setDbUsername] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      getDatabaseUsername().then((res) => {
        if (res && "username" in res && res.username) {
          setDbUsername(res.username);
        }
      });
    }
  }, [isSignedIn]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="flex items-center justify-between p-4 border-b border-border">
      {/* Left Side */}
      <div className="h-10 flex items-center">
        {open && !isMobile ? (
          <ChevronLeftIcon className="w-6 h-6" onClick={toggleSidebar} />
        ) : (
          <div className="flex items-center gap-2">
            <MenuIcon className="w-6 h-6" onClick={toggleSidebar} />
            <Link href="/" >
            <Image
              src={ReddishLogo}
              alt="logo"
              width={120}
              height={120}
              className="hidden md:block"
            />
            <Image
              src={ReddishLogo}
              alt="logo"
              width={100}
              height={100}
              className="block md:hidden"
              />
              </Link>
          </div>
        )}
      </div>

      {/* Center Search Bar */}
      <form
        onSubmit={handleSearch}
        className="hidden md:flex flex-1 max-w-sm mx-4"
      >
        <div className="flex items-center w-full bg-muted rounded-full px-4 py-2">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search posts, communities, users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-0 outline-none px-3 py-1 text-sm text-foreground placeholder-muted-foreground"
          />
        </div>
      </form>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        <CreatePost />

        <DarkModeToggle />

        {isSignedIn && <NotificationBell />}

        {isSignedIn ? (
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Link
                label="My Profile"
                labelIcon={<User className="w-4 h-4 text-muted-foreground" />}
                href={dbUsername ? `/u/${dbUsername}` : "/u/me"}
              />
            </UserButton.MenuItems>
          </UserButton>
        ) : (
          <Button asChild variant="outline">
            <SignInButton mode="modal" />
          </Button>
        )}
      </div>
    </header>
  );
}

export default Header;
