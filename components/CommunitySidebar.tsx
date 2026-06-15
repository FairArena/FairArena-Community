import Link from "next/link";
import { getRelatedSubreddits } from "@/sanity/lib/subreddit/getRelatedSubreddits";
import JoinButton from "./JoinButton";
import { Shield, Calendar, ExternalLink } from "lucide-react";

interface CommunitySidebarProps {
  community: {
    _id: string;
    title?: string | null;
    description?: string | null;
    slug: string | null;
    moderator?: {
      _id?: string;
      username?: string | null;
      imageUrl?: string | null;
    } | null;
    _createdAt?: string;
  };
  isMember: boolean;
  memberCount: number;
  userId: string | null;
}

export default async function CommunitySidebar({
  community,
  isMember,
  memberCount,
  userId,
}: CommunitySidebarProps) {
  const related = (await getRelatedSubreddits(community._id)) as any;

  return (
    <aside className="space-y-4">
      {/* About Community */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-br from-orange-500 to-red-500 p-3">
          <h2 className="text-white font-bold text-sm uppercase tracking-wide">
            About Community
          </h2>
        </div>
        <div className="p-4 space-y-4">
          {community.description && (
            <p className="text-sm text-gray-700 leading-relaxed">{community.description}</p>
          )}

          {/* Member Count */}
          <div className="flex items-center justify-between">
            {userId ? (
              <JoinButton
                subredditId={community._id}
                slug={community.slug || ""}
                initialIsMember={isMember}
                memberCount={memberCount}
              />
            ) : (
              <p className="text-sm text-gray-600">
                <span className="font-semibold">{memberCount.toLocaleString()}</span> members
              </p>
            )}
          </div>

          {/* Creation Date */}
          {community._createdAt && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>
                Created{" "}
                {new Date(community._createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          )}

          {/* Moderator */}
          {community.moderator?.username && (
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <span className="text-gray-500">Moderated by</span>
              <Link
                href={`/u/${community.moderator.username}`}
                className="text-orange-600 hover:underline font-medium"
              >
                u/{community.moderator.username}
              </Link>
            </div>
          )}

          {/* Create Post CTA */}
          <Link
            href={`/create-post?community=${community.slug}`}
            className="block w-full py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold text-center rounded-full transition-colors"
          >
            Create Post
          </Link>
        </div>
      </div>

      {/* Community Rules */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-3 border-b border-gray-100">
          <h3 className="font-bold text-sm text-gray-900">Community Rules</h3>
        </div>
        <div className="p-4">
          <ol className="space-y-3 text-sm text-gray-600">
            {[
              "Be respectful and civil",
              "No spam or self-promotion",
              "Stay on topic",
              "No misinformation",
              "Follow site-wide rules",
            ].map((rule, i) => (
              <li key={i} className="flex gap-2">
                <span className="font-bold text-gray-400 flex-shrink-0">{i + 1}.</span>
                <span>{rule}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Related Communities */}
      {related.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <h3 className="font-bold text-sm text-gray-900">Related Communities</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {related.map((sub: any) => (
              <Link
                key={sub._id}
                href={`/c/${sub.slug}`}
                className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors group"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
                    c/{sub.title}
                  </p>
                  {sub.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{sub.description}</p>
                  )}
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-orange-500 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
