import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FairArena Community Sanity Admin Panel",
  description: "FairArena Community Sanity Admin Panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
