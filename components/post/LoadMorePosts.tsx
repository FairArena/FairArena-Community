"use client";

import { useState, useTransition } from "react";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { fetchPosts } from "@/action/fetchPosts";
import type { PostSortOrder } from "@/sanity/lib/post/getPosts";
import PostCardPresenter from "./PostCardPresenter";

interface LoadMorePostsProps {
  sort?: PostSortOrder;
  initialOffset?: number;
  limit?: number;
  userId: string | null;
}

export default function LoadMorePosts({
  sort = "new",
  initialOffset = 10,
  limit = 10,
  userId,
}: LoadMorePostsProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [offset, setOffset] = useState(initialOffset);
  const [hasMore, setHasMore] = useState(true);
  const [isPending, startTransition] = useTransition();

  const handleLoadMore = () => {
    startTransition(async () => {
      try {
        const result = await fetchPosts(sort, {
          limit,
          offset,
        });

        const newPosts = result.posts as any[];

        if (!newPosts || newPosts.length === 0) {
          setHasMore(false);
        } else {
          setPosts((prev) => [...prev, ...newPosts]);
          setOffset((prev) => prev + limit);
        }
      } catch (error) {
        console.error("Failed to load more posts:", error);
        setHasMore(false);
      }
    });
  };

  return (
    <>
      <div className="space-y-4">
        {posts.map((item) => (
          <PostCardPresenter
            key={item.post._id}
            post={item.post}
            userId={userId}
            votes={item.votes}
            userVote={item.userVote}
            commentsCount={item.commentsCount}
            isBookmarked={item.isBookmarked}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-6">
          <Button
            onClick={handleLoadMore}
            disabled={isPending}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More Posts"
            )}
          </Button>
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="text-center text-muted-foreground text-sm mt-6">
          No more posts to load
        </div>
      )}
    </>
  );
}
