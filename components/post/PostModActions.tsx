"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Trash2,
  Lock,
  Pin,
  StickyNote,
  MoreVertical,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  removePost,
  lockPost,
  stickyPost,
  updatePostModNotes,
} from "@/action/communityModActions";
import { toast } from "sonner";

interface PostModActionsProps {
  postId: string;
  subredditSlug: string;
  isModerator: boolean;
  isPinned?: boolean;
  isLocked?: boolean;
  currentModNotes?: string;
}

export function PostModActions({
  postId,
  subredditSlug,
  isModerator,
  isPinned = false,
  isLocked = false,
  currentModNotes = "",
}: PostModActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [removeReason, setRemoveReason] = useState("");
  const [modNotes, setModNotes] = useState(currentModNotes);
  const [isPinnedState, setIsPinnedState] = useState(isPinned);
  const [isLockedState, setIsLockedState] = useState(isLocked);

  if (!isModerator) {
    return null;
  }

  const handleRemovePost = async () => {
    setIsLoading(true);
    try {
      const result = await removePost(subredditSlug, postId, removeReason);

      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Post removed successfully");
        setShowRemoveDialog(false);
        setRemoveReason("");
      }
    } catch (error) {
      console.error("Failed to remove post:", error);
      toast.error("Failed to remove post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLockPost = async () => {
    setIsLoading(true);
    try {
      const result = await lockPost(subredditSlug, postId);

      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        setIsLockedState(true);
      }
    } catch (error) {
      console.error("Failed to lock post:", error);
      toast.error("Failed to lock post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStickyPost = async (pin: boolean) => {
    setIsLoading(true);
    try {
      const result = await stickyPost(subredditSlug, postId, pin);

      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        setIsPinnedState(pin);
      }
    } catch (error) {
      console.error("Failed to sticky post:", error);
      toast.error("Failed to sticky post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveModNotes = async () => {
    setIsLoading(true);
    try {
      const result = await updatePostModNotes(subredditSlug, postId, modNotes);

      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Mod notes updated");
        setShowNotesDialog(false);
      }
    } catch (error) {
      console.error("Failed to save mod notes:", error);
      toast.error("Failed to save mod notes");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Sticky/Pin Button */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            title={isPinnedState ? "Unpin post" : "Pin post"}
            className="gap-1.5"
            disabled={isLoading}
          >
            <Pin className="w-4 h-4" />
            {isPinnedState && <span className="text-xs">Pinned</span>}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isPinnedState ? "Unpin Post" : "Pin Post"}
            </DialogTitle>
            <DialogDescription>
              {isPinnedState
                ? "This post will no longer appear pinned at the top of the community."
                : "This post will appear pinned at the top of your community feed."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => {}}>
              Cancel
            </Button>
            <Button
              onClick={() => handleStickyPost(!isPinnedState)}
              disabled={isLoading}
              className={
                isPinnedState
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "bg-green-600 hover:bg-green-700"
              }
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isPinnedState ? "Unpin" : "Pin"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lock Button */}
      <Button
        size="sm"
        variant="outline"
        onClick={handleLockPost}
        disabled={isLoading}
        title={isLockedState ? "Unlock post" : "Lock post"}
        className="gap-1.5"
      >
        <Lock className="w-4 h-4" />
        {isLockedState && <span className="text-xs">Locked</span>}
      </Button>

      {/* More Options Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" disabled={isLoading}>
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {/* Mod Notes */}
          <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
            <DialogTrigger asChild>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setShowNotesDialog(true);
                }}
              >
                <StickyNote className="w-4 h-4 mr-2" />
                <span>View/Edit Mod Notes</span>
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Mod Notes</DialogTitle>
                <DialogDescription>
                  Add notes about this post for moderators
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  value={modNotes}
                  onChange={(e) => setModNotes(e.target.value)}
                  placeholder="Add mod notes..."
                  rows={4}
                  maxLength={500}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {modNotes.length}/500
                </p>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowNotesDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveModNotes}
                  disabled={isLoading}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Notes
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <DropdownMenuSeparator />

          {/* Remove Post */}
          <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
            <DialogTrigger asChild>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setShowRemoveDialog(true);
                }}
                className="text-red-600 focus:text-red-600 focus:bg-red-600/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                <span>Remove Post</span>
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Remove Post
                </DialogTitle>
                <DialogDescription>
                  This action will remove the post from the community. Users will
                  see it was removed by a moderator.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Reason for removal (optional)
                  </label>
                  <Input
                    value={removeReason}
                    onChange={(e) => setRemoveReason(e.target.value)}
                    placeholder="e.g., Violates rule 3"
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {removeReason.length}/200
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setShowRemoveDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRemovePost}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Remove
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
