import type { Metadata } from "next";
import "../globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Header from "@/components/header/Header";
import { SanityLive } from "@/sanity/lib/live";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "FairArena Community",
  description:
    "Join the FairArena Community to connect with members, share ideas, participate in discussions, and collaborate in a transparent, fair, and engaging environment.",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className="antialiased"
        >
          <ThemeProvider>
            <SidebarProvider>
              <AppSidebar />

              <SidebarInset>
                <Header />

                <div className="flex flex-col">{children}</div>
              </SidebarInset>
            </SidebarProvider>

            <SanityLive />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
