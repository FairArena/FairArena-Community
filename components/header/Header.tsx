"use client";

import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "../ui/button";
import ReddishLogo from "@/images/Reddish Full.png";
import { ChevronLeftIcon, MenuIcon, User } from "lucide-react";
import Image from "next/image";
import { useSidebar } from "../ui/sidebar";
import CreatePost from "../post/CreatePost";
import NotificationBell from "./NotificationBell";
import { useEffect, useState } from "react";
import { getDatabaseUsername } from "@/action/getDatabaseUsername";

function Header() {
  const { toggleSidebar, open, isMobile } = useSidebar();
  const { isSignedIn, user } = useUser();
  const [dbUsername, setDbUsername] = useState<string | null>(null);

  useEffect(() => {
    if (isSignedIn) {
      getDatabaseUsername().then((res) => {
        if (res && "username" in res && res.username) {
          setDbUsername(res.username);
        }
      });
    }
  }, [isSignedIn]);

  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-200">
      {/* Left Side */}
      <div className="h-10 flex items-center">
        {open && !isMobile ? (
          <ChevronLeftIcon className="w-6 h-6" onClick={toggleSidebar} />
        ) : (
          <div className="flex items-center gap-2">
            <MenuIcon className="w-6 h-6" onClick={toggleSidebar} />
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
          </div>
        )}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        <CreatePost />

        {isSignedIn && <NotificationBell />}

        {isSignedIn ? (
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Link
                label="My Profile"
                labelIcon={<User className="w-4 h-4 text-gray-500" />}
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
