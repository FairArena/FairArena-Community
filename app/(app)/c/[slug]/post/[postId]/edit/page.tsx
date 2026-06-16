import { getPostById } from "@/sanity/lib/post/getPostById";
import { currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import EditPostForm from "@/components/post/EditPostForm";
import type { Metadata } from "next";

interface EditPostPageProps {
  params: Promise<{ slug: string; postId: string }>;
}

export async function generateMetadata({ params }: EditPostPageProps): Promise<Metadata> {
  const { postId } = await params;
  const post = await getPostById(postId);

  if (!post) return { title: "Post Not Found" };

  return {
    title: `Edit Post: ${post.title} | FairArena`,
  };
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { slug, postId } = await params;

  const [postResult, user] = await Promise.all([
    getPostById(postId),
    currentUser(),
  ]);

  const post = postResult as any;

  if (!post || post.isDeleted) return notFound();

  // If user is not logged in, redirect to sign in or return unauthorized
  if (!user) {
    redirect(`/sign-in?redirect=/c/${slug}/post/${postId}/edit`);
  }

  // Verify authorization: only the author can edit their post
  if (post.author?._id !== user.id) {
    redirect(`/c/${slug}/post/${postId}`);
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <EditPostForm post={post} />
    </div>
  );
}
