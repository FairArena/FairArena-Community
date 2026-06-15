import PostsList from "@/components/post/PostsList";
import HomeSidebar from "@/components/HomeSidebar";
import { Suspense } from "react";
import Link from "next/link";
import { Flame, TrendingUp, Clock } from "lucide-react";
import type { PostSortOrder } from "@/sanity/lib/post/getPosts";

interface HomePageProps {
  searchParams: Promise<{ sort?: string }>;
}

export default async function Home({ searchParams }: HomePageProps) {
  const { sort: sortParam } = await searchParams;
  const validSorts: PostSortOrder[] = ["new", "top", "hot"];
  const sort: PostSortOrder = validSorts.includes(sortParam as PostSortOrder)
    ? (sortParam as PostSortOrder)
    : "new";

  const sortTabs = [
    { key: "new" as PostSortOrder, label: "New", icon: <Clock className="w-4 h-4" /> },
    { key: "hot" as PostSortOrder, label: "Hot", icon: <Flame className="w-4 h-4" /> },
    { key: "top" as PostSortOrder, label: "Top", icon: <TrendingUp className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Banner */}
      <section className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center">
            <div>
              <h1 className="text-2xl font-bold">Home</h1>
              <p className="text-sm text-gray-600">
                Recent posts from all communities
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Two-column layout */}
      <section className="my-6">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex gap-6">
            {/* Left: Posts */}
            <div className="flex-1 min-w-0">
              {/* Sort Tabs */}
              <div className="bg-white rounded-lg border border-gray-200 p-2 flex gap-1 mb-4">
                {sortTabs.map((tab) => (
                  <Link
                    key={tab.key}
                    href={`/?sort=${tab.key}`}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                      sort === tab.key
                        ? "bg-orange-100 text-orange-700"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </Link>
                ))}
              </div>

              <Suspense
                fallback={
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-white rounded-md border border-gray-200 h-40 animate-pulse"
                      />
                    ))}
                  </div>
                }
              >
                <PostsList sort={sort} />
              </Suspense>
            </div>

            {/* Right: Sidebar */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <Suspense
                fallback={<div className="bg-white rounded-lg border border-gray-200 h-64 animate-pulse" />}
              >
                <HomeSidebar />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
