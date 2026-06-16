import PostsList from "@/components/post/PostsList";

export default function PopularPage() {
  return (
    <>
      <section className="bg-card border-b">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center">
            <div>
              <h1 className="text-2xl font-bold">Popular</h1>
              <p className="text-sm text-muted-foreground">
                Top posts from all communities
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="my-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col gap-4">
            <PostsList sort="top" />
          </div>
        </div>
      </section>
    </>
  );
}
