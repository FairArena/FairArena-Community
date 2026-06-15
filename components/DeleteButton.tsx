"use client";

import { deleteComment } from "@/action/deleteComment";
import { deletePost } from "@/action/deletePost";
import { useUser } from "@clerk/nextjs";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";

interface DeleteButtonProps {
  contentId: string;
  contentType: string;
  contentOwnerId: string;
}

function DeleteButton({
  contentId,
  contentType,
  contentOwnerId,
}: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isSignedIn, user } = useUser();

  const handleDelete = async () => {
    if (isDeleting || !isSignedIn) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response =
        contentType === "post"
          ? await deletePost(contentId)
          : await deleteComment(contentId);

      if (response.error) {
        setError(response.error);
      }
    } catch (error) {
      setError("Failed to delete. Please try again.");
      console.error(`Failed to delete ${contentType}:`, error);
    } finally {
      setIsDeleting(false);
    }
  };

  const isOwner = contentOwnerId === user?.id;

  if (!isOwner) return null;

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting || !isSignedIn}
        className={`flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-red-500 transition-colors mt-1 disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-label={`Delete ${contentType}`}
      >
        <Trash2 size={14} />
        <span className="hidden md:block">
          {isDeleting
            ? "Deleting..."
            : isSignedIn
              ? "Delete"
              : "Sign in to delete"}
        </span>
        {error && <span className="text-red-500 ml-2">{error}</span>}
      </button>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title={`Delete ${contentType}`}
        description="Are you sure you want to delete this? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </>
  );
}

export default DeleteButton;
