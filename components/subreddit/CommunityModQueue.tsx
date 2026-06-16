"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Eye, Trash2, Check, X } from "lucide-react";
import { approvePost } from "@/action/approvePost";
import { rejectPost } from "@/action/rejectPost";
import { removePost } from "@/action/removePost";
import { updateModNotes } from "@/action/updateModNotes";
import { toast } from "sonner";

interface PendingPost {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    username: string;
  };
  createdAt: string;
  modNotes?: string;
  isApproved: boolean;
}

interface CommunityModQueueProps {
  subredditId: string;
  pendingPosts: PendingPost[];
  userRole?: "admin" | "moderator";
}

export function CommunityModQueue({
  subredditId,
  pendingPosts,
  userRole,
}: CommunityModQueueProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});
  const [modNotes, setModNotes] = useState<Record<string, string>>(
    pendingPosts.reduce((acc, post) => ({ ...acc, [post._id]: post.modNotes || "" }), {})
  );
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);

  if (userRole !== "admin" && userRole !== "moderator") {
    return null;
  }

  const handleApprovePost = async (postId: string) => {
    setIsLoading(true);
    try {
      await approvePost(subredditId, postId);
      toast.success("Post approved");
    } catch (error) {
      console.error("Failed to approve post:", error);
      toast.error("Failed to approve post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectPost = async (postId: string) => {
    const reason = rejectReasons[postId] || "";

    setIsLoading(true);
    try {
      await rejectPost(subredditId, postId, reason);
      toast.success("Post rejected");
      setRejectReasons((prev) => {
        const updated = { ...prev };
        delete updated[postId];
        return updated;
      });
    } catch (error) {
      console.error("Failed to reject post:", error);
      toast.error("Failed to reject post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePost = async (postId: string) => {
    if (!confirm("Are you sure you want to remove this post?")) return;

    setIsLoading(true);
    try {
      await removePost(subredditId, postId);
      toast.success("Post removed");
    } catch (error) {
      console.error("Failed to remove post:", error);
      toast.error("Failed to remove post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveModNotes = async (postId: string) => {
    setIsLoading(true);
    try {
      await updateModNotes(subredditId, postId, modNotes[postId]);
      toast.success("Mod notes saved");
      setEditingNotesId(null);
    } catch (error) {
      console.error("Failed to save mod notes:", error);
      toast.error("Failed to save mod notes");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="font-bold text-foreground">
          Mod Queue ({pendingPosts.length})
        </h3>
      </div>

      {pendingPosts.length > 0 ? (
        <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
          {pendingPosts.map((post) => (
            <div key={post._id} className="p-4 hover:bg-muted/30 transition-colors">
              {/* Post Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground text-sm line-clamp-2">
                    {post.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    by u/{post.author.username} • {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setExpandedPostId(expandedPostId === post._id ? null : post._id)
                    }
                    className="gap-1"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedPostId === post._id && (
                <div className="mt-4 pt-4 border-t border-border space-y-4">
                  <div className="bg-muted/50 rounded p-3 max-h-48 overflow-y-auto">
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {post.content}
                    </p>
                  </div>

                  {/* Mod Notes Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-foreground">
                        Mod Notes
                      </label>
                      {editingNotesId !== post._id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingNotesId(post._id)}
                          className="text-xs h-auto py-0.5"
                        >
                          Edit
                        </Button>
                      )}
                    </div>

                    {editingNotesId === post._id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={modNotes[post._id] || ""}
                          onChange={(e) =>
                            setModNotes((prev) => ({
                              ...prev,
                              [post._id]: e.target.value,
                            }))
                          }
                          placeholder="Add mod notes..."
                          rows={2}
                          maxLength={500}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveModNotes(post._id)}
                            disabled={isLoading}
                            className="bg-orange-600 hover:bg-orange-700 text-white h-auto py-1"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingNotesId(null)}
                            className="h-auto py-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : modNotes[post._id] ? (
                      <p className="text-xs bg-muted/50 p-2 rounded text-muted-foreground">
                        {modNotes[post._id]}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No notes</p>
                    )}
                  </div>

                  {/* Rejection Reason */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground">
                      Rejection Reason (if rejecting)
                    </label>
                    <Input
                      value={rejectReasons[post._id] || ""}
                      onChange={(e) =>
                        setRejectReasons((prev) => ({
                          ...prev,
                          [post._id]: e.target.value,
                        }))
                      }
                      placeholder="e.g., Violates rule 3"
                      className="text-sm"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      onClick={() => handleApprovePost(post._id)}
                      disabled={isLoading}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-1"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleRejectPost(post._id)}
                      disabled={isLoading}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white gap-1"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleRemovePost(post._id)}
                      disabled={isLoading}
                      variant="outline"
                      className="flex-1 text-red-600 border-red-600/30 hover:bg-red-600/10 gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              )}

              {/* Quick Action Buttons (when collapsed) */}
              {expandedPostId !== post._id && (
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={() => handleApprovePost(post._id)}
                    disabled={isLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white h-8"
                  >
                    {isLoading && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleRejectPost(post._id)}
                    disabled={isLoading}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white h-8"
                  >
                    {isLoading && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No posts pending approval
          </p>
        </div>
      )}
    </div>
  );
}
