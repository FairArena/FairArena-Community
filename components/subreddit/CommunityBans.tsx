"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Search, Trash2, UserX } from "lucide-react";
import { banUserFromCommunity as banUser, unbanUserFromCommunity as unbanUser } from "@/action/communityBanActions";
import { toast } from "sonner";

interface BannedUser {
  userId: string;
  username: string;
  reason: string;
  bannedAt: string;
  banDuration?: "permanent" | "temporary";
  banExpiresAt?: string;
}

interface CommunityBansProps {
  subredditId: string;
  bannedUsers: BannedUser[];
  userRole?: "admin" | "moderator";
}

const BAN_DURATIONS = [
  { label: "1 Day", value: 1 },
  { label: "7 Days", value: 7 },
  { label: "30 Days", value: 30 },
  { label: "Permanent", value: null },
];

export function CommunityBans({
  subredditId,
  bannedUsers,
  userRole,
}: CommunityBansProps) {
  const [showBanForm, setShowBanForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState<number | null>(null);
  const [banType, setBanType] = useState<"permanent" | "temporary">("permanent");
  const [searchResults, setSearchResults] = useState<Array<{ _id: string; username: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");

  if (userRole !== "admin" && userRole !== "moderator") {
    return null;
  }

  const handleSearchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
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

  const handleBanUser = async () => {
    if (!selectedUserId) {
      toast.error("Please select a user");
      return;
    }

    setIsLoading(true);
    try {
      const durationDays = banType === "permanent" ? null : banDuration;

      await banUser(subredditId, selectedUserId, {
        reason: banReason.trim(),
        duration: durationDays,
        type: banType,
      });

      toast.success("User banned successfully");
      setSelectedUserId("");
      setSearchQuery("");
      setBanReason("");
      setBanDuration(null);
      setBanType("permanent");
      setSearchResults([]);
      setShowBanForm(false);
    } catch (error) {
      console.error("Failed to ban user:", error);
      toast.error("Failed to ban user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnban = async (userId: string) => {
    if (!confirm("Are you sure you want to unban this user?")) return;

    setIsLoading(true);
    try {
      await unbanUser(subredditId, userId);
      toast.success("User unbanned");
    } catch (error) {
      console.error("Failed to unban user:", error);
      toast.error("Failed to unban user");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBans = bannedUsers.filter((ban) =>
    ban.username.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const isBanExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-4">
      {/* Ban Form */}
      {showBanForm && (
        <div className="bg-card rounded-lg border border-border p-4 space-y-4">
          <h4 className="font-semibold text-foreground">Ban a User</h4>

          {/* User Search */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Select User</label>
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
              <div className="space-y-2 max-h-48 overflow-y-auto bg-muted/50 rounded p-2">
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
              <div className="p-2 bg-orange-600/10 border border-orange-600/30 rounded text-sm text-orange-600">
                Selected: {searchQuery}
              </div>
            )}
          </div>

          {/* Ban Reason */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Ban Reason (optional)
            </label>
            <Textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="e.g., Repeated harassment"
              rows={2}
              maxLength={300}
            />
          </div>

          {/* Ban Type and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Ban Type</label>
              <select
                value={banType}
                onChange={(e) => {
                  const type = e.target.value as "permanent" | "temporary";
                  setBanType(type);
                  if (type === "permanent") setBanDuration(null);
                }}
                className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground text-sm"
              >
                <option value="permanent">Permanent</option>
                <option value="temporary">Temporary</option>
              </select>
            </div>

            {banType === "temporary" && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Duration</label>
                <select
                  value={banDuration || ""}
                  onChange={(e) => setBanDuration(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground text-sm"
                >
                  <option value="">Select duration</option>
                  {BAN_DURATIONS.filter((d) => d.value !== null).map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Quick Duration Buttons */}
          {banType === "temporary" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Or select:</label>
              <div className="grid grid-cols-4 gap-2">
                {BAN_DURATIONS.map((d) => (
                  <Button
                    key={d.value}
                    size="sm"
                    variant={banDuration === d.value ? "default" : "outline"}
                    onClick={() => setBanDuration(d.value)}
                    className={
                      banDuration === d.value ? "bg-orange-600 hover:bg-orange-700" : ""
                    }
                  >
                    {d.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleBanUser}
              disabled={isLoading || !selectedUserId}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirm Ban
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowBanForm(false);
                setSelectedUserId("");
                setSearchQuery("");
                setBanReason("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Banned Users List */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-foreground">Banned Users</h3>
          <Button
            size="sm"
            onClick={() => setShowBanForm(!showBanForm)}
            className="gap-2 bg-red-600 hover:bg-red-700"
          >
            <UserX className="w-4 h-4" />
            Ban User
          </Button>
        </div>

        {/* Search Filter */}
        <div className="p-3 border-b border-border">
          <Input
            placeholder="Search banned users..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="text-sm"
          />
        </div>

        {/* Banned Users */}
        {filteredBans.length > 0 ? (
          <div className="divide-y divide-border max-h-96 overflow-y-auto">
            {filteredBans.map((ban) => {
              const isExpired = isBanExpired(ban.banExpiresAt);

              return (
                <div key={ban.userId} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{ban.username}</p>
                        {isExpired ? (
                          <span className="text-xs bg-green-600/10 text-green-600 px-2 py-0.5 rounded border border-green-600/20">
                            Expired
                          </span>
                        ) : ban.banDuration === "permanent" ? (
                          <span className="text-xs bg-red-600/10 text-red-600 px-2 py-0.5 rounded border border-red-600/20">
                            Permanent
                          </span>
                        ) : (
                          <span className="text-xs bg-orange-600/10 text-orange-600 px-2 py-0.5 rounded border border-orange-600/20">
                            Temporary
                          </span>
                        )}
                      </div>

                      {ban.reason && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Reason: {ban.reason}
                        </p>
                      )}

                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Banned {new Date(ban.bannedAt).toLocaleDateString()}</span>
                        {ban.banExpiresAt && !isExpired && (
                          <span>
                            Expires {new Date(ban.banExpiresAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleUnban(ban.userId)}
                      disabled={isLoading}
                      className="text-red-600 border-red-600/30 hover:bg-red-600/10"
                      variant="outline"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">
              {bannedUsers.length === 0 ? "No banned users" : "No results"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
