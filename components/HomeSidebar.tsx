import Link from "next/link";
import { getSubreddits } from "@/sanity/lib/subreddit/getSubreddits";
import { Flame, PenSquare, Users, TrendingUp, ArrowRight } from "lucide-react";

export default async function HomeSidebar() {
  const subreddits = await getSubreddits();
  const topSubreddits = subreddits?.slice(0, 5) || [];

  return (
    <aside className="space-y-4">
      {/* Welcome Card */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="bg-gradient-to-br from-orange-500 to-red-500 h-16 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <Flame className="w-8 h-8 text-white/80" />
          </div>
        </div>
        <div className="p-4 space-y-3">
          <h2 className="font-bold text-foreground">Welcome to FairArena Community!</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your home for conversations, ideas, and communities. Explore what&#39;s happening or dive into a topic you love.
          </p>
          <div className="flex flex-col gap-2">
            <Link
              href="/create-post"
              className="flex items-center justify-center gap-2 py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-full transition-colors"
            >
              <PenSquare className="w-4 h-4" />
              Create Post
            </Link>
            <Link
              href="/create-community"
              className="flex items-center justify-center gap-2 py-2 px-4 bg-background border border-border hover:border-orange-400 text-foreground hover:text-orange-600 text-sm font-semibold rounded-full transition-colors"
            >
              <Users className="w-4 h-4" />
              Create Community
            </Link>
          </div>
        </div>
      </div>

      {/* Community Spotlight */}
      {topSubreddits.length > 0 && (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="flex items-center gap-2 p-3 border-b border-border">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <h3 className="font-bold text-sm text-foreground">Top Communities</h3>
          </div>
          <div className="divide-y divide-border">
            {topSubreddits.map((sub, index) => (
              <Link
                key={sub._id}
                href={`/c/${sub.slug}`}
                className="flex items-center gap-3 p-3 hover:bg-orange-50/50 transition-colors group"
              >
                <span className="text-sm font-bold text-muted-foreground w-4 text-center flex-shrink-0">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground group-hover:text-orange-600 transition-colors truncate">
                    c/{sub.title}
                  </p>
                  {sub.description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{sub.description}</p>
                  )}
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-orange-500 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Site Rules */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="p-3 border-b border-border">
          <h3 className="font-bold text-sm text-foreground">FairArena Community Rules</h3>
        </div>
        <div className="p-3">
          <ol className="space-y-2 text-xs text-foreground">
            {[
              "Remember the human",
              "Behave like you would in real life",
              "Look for the original source of content",
              "Search for duplicates before posting",
              "Read the community rules",
            ].map((rule, i) => (
              <li key={i} className="flex gap-2">
                <span className="font-bold text-muted-foreground flex-shrink-0">{i + 1}.</span>
                <span>{rule}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </aside>
  );
}
