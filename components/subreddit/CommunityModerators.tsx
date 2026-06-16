"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Shield, Trash2, UserPlus } from "lucide-react";
import { addModerator, removeModerator, changeModeratorsRole } from "@/action/moderatorActions";
import { toast } from "sonner";

interface Moderator {
  _id: string;
  username: string;
  imageUrl?: string;
  role: "admin" | "moderator";
  addedAt: string;
}

interface CommunityModeratorsProps {
  subredditId: string;
  moderators: Moderator[];
  currentUserRole?: "admin" | "moderator";
}

export function CommunityModerators({
  subredditId,
  moderators,
  currentUserRole,
}: CommunityModeratorsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ _id: string; username: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  if (currentUserRole !== "admin") {
    return null;
  }

  const handleSearchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // This would call a server action to search for users
      // For now, we'll show a placeholder
      const res = await fetch(`/api/search-users?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.users || []);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search users");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddModerator = async () => {
    if (!selectedUserId) {
      toast.error("Please select a user");
      return;
    }

    setIsLoading(true);
    try {
      await addModerator(subredditId, selectedUserId);
      toast.success("Moderator added successfully");
      setSelectedUserId("");
      setSearchQuery("");
      setSearchResults([]);
      setShowAddForm(false);
    } catch (error) {
      console.error("Failed to add moderator:", error);
      toast.error("Failed to add moderator");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveModerator = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this moderator?")) return;

    setIsLoading(true);
    try {
      await removeModerator(subredditId, userId);
      toast.success("Moderator removed");
    } catch (error) {
      console.error("Failed to remove moderator:", error);
      toast.error("Failed to remove moderator");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeRole = async (userId: string, newRole: "admin" | "moderator") => {
    setIsLoading(true);
    try {
      await changeModeratorsRole(subredditId, userId, newRole);
      toast.success(`Role changed to ${newRole}`);
    } catch (error) {
      console.error("Failed to change role:", error);
      toast.error("Failed to change role");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-bold text-foreground">Moderators</h3>
        <Button
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          className="gap-2 bg-orange-600 hover:bg-orange-700"
        >
          <UserPlus className="w-4 h-4" />
          Add Moderator
        </Button>
      </div>

      {showAddForm && (
        <div className="p-4 border-b border-border bg-muted/50 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearchUsers(e.target.value);
              }}
              className="pl-10"
            />
          </div>

          {isSearching && (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          )}

          {searchResults.length > 0 && !selectedUserId && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {searchResults.map((user) => (
                <button
                  key={user._id}
                  onClick={() => {
                    setSelectedUserId(user._id);
                    setSearchQuery(user.username);
                  }}
                  className="w-full text-left p-2 hover:bg-border rounded transition-colors text-sm text-foreground"
                >
                  {user.username}
                </button>
              ))}
            </div>
          )}

          {selectedUserId && (
            <div className="flex gap-2">
              <Button
                onClick={handleAddModerator}
                disabled={isLoading}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Confirm
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedUserId("");
                  setSearchQuery("");
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="divide-y divide-border">
        {moderators.length > 0 ? (
          moderators.map((mod) => (
            <div key={mod._id} className="p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  {mod.imageUrl && (
                    <img
                      src={mod.imageUrl}
                      alt={mod.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{mod.username}</p>
                      <div className="flex items-center gap-1 text-xs bg-orange-600/10 text-orange-600 px-2 py-0.5 rounded-full border border-orange-600/20">
                        <Shield className="w-3 h-3" />
                        {mod.role}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Added {new Date(mod.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {mod.role === "moderator" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleChangeRole(mod._id, "admin")}
                      disabled={isLoading}
                      className="text-xs"
                    >
                      Make Admin
                    </Button>
                  )}

                  {mod.role === "admin" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleChangeRole(mod._id, "moderator")}
                      disabled={isLoading}
                      className="text-xs"
                    >
                      Demote
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveModerator(mod._id)}
                    disabled={isLoading}
                    className="text-red-600 border-red-600/30 hover:bg-red-600/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No moderators assigned yet
          </div>
        )}
      </div>
    </div>
  );
}
