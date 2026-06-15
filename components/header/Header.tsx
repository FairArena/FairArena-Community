"use client";

import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "../ui/button";
import ReddishLogo from "@/images/Reddish Full.png";
import { ChevronLeftIcon, MenuIcon } from "lucide-react";
import Image from "next/image";
import { useSidebar } from "../ui/sidebar";
import CreatePost from "../post/CreatePost";

function Header() {
  const { toggleSidebar, open, isMobile } = useSidebar();
  const { isSignedIn } = useUser();

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

        {isSignedIn ? (
          <UserButton />
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
