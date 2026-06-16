"use client";

import * as React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, X, GripVertical } from "lucide-react";
import { saveCommunitySettings } from "@/action/saveCommunitySettings";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Rule {
  id: string;
  title: string;
  description: string;
}

interface CommunitySettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subredditId: string;
  initialData?: {
    title: string;
    description: string;
    type: "public" | "restricted" | "private";
    nsfw: boolean;
    rules: Rule[];
    primaryColor?: string;
    allowImages?: boolean;
    allowVideos?: boolean;
    allowText?: boolean;
    allowLinks?: boolean;
    archiveTime?: number;
    postApprovalRequired?: boolean;
    bannedUsers?: Array<{ userId: string; username: string; reason: string }>;
  };
  userRole?: "admin" | "moderator";
}

export function CommunitySettingsDialog({
  open,
  onOpenChange,
  subredditId,
  initialData,
  userRole,
}: CommunitySettingsDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [rules, setRules] = useState<Rule[]>(initialData?.rules || []);
  const [activeTab, setActiveTab] = useState("basic");

  // Basic Settings
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [type, setType] = useState<"public" | "restricted" | "private">(
    initialData?.type || "public"
  );
  const [nsfw, setNsfw] = useState(initialData?.nsfw || false);

  // Appearance
  const [primaryColor, setPrimaryColor] = useState(initialData?.primaryColor || "#ea580c");

  // Moderation
  const [allowImages, setAllowImages] = useState(initialData?.allowImages !== false);
  const [allowVideos, setAllowVideos] = useState(initialData?.allowVideos !== false);
  const [allowText, setAllowText] = useState(initialData?.allowText !== false);
  const [allowLinks, setAllowLinks] = useState(initialData?.allowLinks !== false);
  const [archiveTime, setArchiveTime] = useState(initialData?.archiveTime || 180);
  const [postApprovalRequired, setPostApprovalRequired] = useState(
    initialData?.postApprovalRequired || false
  );

  if (!userRole || (userRole !== "admin" && userRole !== "moderator")) {
    return null;
  }

  const addRule = () => {
    setRules([...rules, { id: Date.now().toString(), title: "", description: "" }]);
  };

  const updateRule = (id: string, field: "title" | "description", value: string) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const removeRule = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
  };

  const moveRule = (id: string, direction: "up" | "down") => {
    const index = rules.findIndex((r) => r.id === id);
    if (index === -1) return;

    if (direction === "up" && index > 0) {
      const newRules = [...rules];
      [newRules[index - 1], newRules[index]] = [newRules[index], newRules[index - 1]];
      setRules(newRules);
    } else if (direction === "down" && index < rules.length - 1) {
      const newRules = [...rules];
      [newRules[index], newRules[index + 1]] = [newRules[index + 1], newRules[index]];
      setRules(newRules);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Community title is required");
      return;
    }

    setIsLoading(true);
    try {
      await saveCommunitySettings(subredditId, {
        title: title.trim(),
        description: description.trim(),
        type,
        nsfw,
        rules: rules.filter((r) => r.title.trim()),
        primaryColor,
        allowImages,
        allowVideos,
        allowText,
        allowLinks,
        archiveTime,
        postApprovalRequired,
      });

      toast.success("Community settings saved successfully");
      onOpenChange(false);
      router.refresh();
      window.location.reload();
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save community settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Community Settings</DialogTitle>
          <DialogDescription>
            Manage your community settings, rules, and moderation options
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
            <TabsTrigger value="bans">Bans</TabsTrigger>
          </TabsList>

          {/* Basic Tab */}
          <TabsContent value="basic" className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Community Title
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter community title"
                maxLength={300}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us about your community"
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {description.length}/1000 characters
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Community Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground"
                >
                  <option value="public">Public</option>
                  <option value="restricted">Restricted</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules" className="space-y-4">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {rules.map((rule, index) => (
                <div
                  key={rule.id}
                  className="p-3 border border-border rounded-md bg-muted/50 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                      <GripVertical className="w-4 h-4" />
                      Rule {index + 1}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => moveRule(rule.id, "up")}
                        disabled={index === 0}
                        className="px-2 py-1 text-xs bg-muted border border-border rounded disabled:opacity-50 hover:bg-border transition-colors"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveRule(rule.id, "down")}
                        disabled={index === rules.length - 1}
                        className="px-2 py-1 text-xs bg-muted border border-border rounded disabled:opacity-50 hover:bg-border transition-colors"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => removeRule(rule.id)}
                        className="px-2 py-1 text-xs bg-red-600/10 border border-red-600/30 text-red-600 rounded hover:bg-red-600/20 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <Input
                    value={rule.title}
                    onChange={(e) => updateRule(rule.id, "title", e.target.value)}
                    placeholder="Rule title (e.g., No harassment)"
                    maxLength={100}
                  />
                  <Textarea
                    value={rule.description}
                    onChange={(e) => updateRule(rule.id, "description", e.target.value)}
                    placeholder="Rule description"
                    rows={2}
                    maxLength={500}
                  />
                </div>
              ))}
            </div>

            <Button
              onClick={addRule}
              variant="outline"
              className="w-full"
            >
              Add Rule
            </Button>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Primary Color
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-10 rounded border border-border cursor-pointer"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#ea580c"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="bg-muted/50 border border-border rounded-md p-4">
              <p className="text-sm text-muted-foreground">
                Icon and banner upload functionality would be implemented here with image upload handlers.
              </p>
            </div>
          </TabsContent>

          {/* Moderation Tab */}
          <TabsContent value="moderation" className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Allowed Content Types</h4>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowText}
                  onChange={(e) => setAllowText(e.target.checked)}
                  className="w-4 h-4 rounded border border-border"
                />
                <span className="text-sm text-foreground">Allow Text Posts</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowImages}
                  onChange={(e) => setAllowImages(e.target.checked)}
                  className="w-4 h-4 rounded border border-border"
                />
                <span className="text-sm text-foreground">Allow Image Posts</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowVideos}
                  onChange={(e) => setAllowVideos(e.target.checked)}
                  className="w-4 h-4 rounded border border-border"
                />
                <span className="text-sm text-foreground">Allow Video Posts</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowLinks}
                  onChange={(e) => setAllowLinks(e.target.checked)}
                  className="w-4 h-4 rounded border border-border"
                />
                <span className="text-sm text-foreground">Allow Link Posts</span>
              </label>
            </div>

            <div className="border-t border-border pt-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Archive Time (days)
              </label>
              <Input
                type="number"
                value={archiveTime}
                onChange={(e) => setArchiveTime(parseInt(e.target.value) || 180)}
                min="1"
                max="999"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Posts will be archived after this many days
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer border-t border-border pt-4">
              <input
                type="checkbox"
                checked={postApprovalRequired}
                onChange={(e) => setPostApprovalRequired(e.target.checked)}
                className="w-4 h-4 rounded border border-border"
              />
              <span className="text-sm font-medium text-foreground">
                Require Post Approval
              </span>
            </label>
          </TabsContent>

          {/* Bans Tab */}
          <TabsContent value="bans" className="space-y-4">
            {initialData?.bannedUsers && initialData.bannedUsers.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {initialData.bannedUsers.map((ban) => (
                  <div
                    key={ban.userId}
                    className="flex items-center justify-between p-3 bg-muted/50 border border-border rounded-md"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{ban.username}</p>
                      {ban.reason && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Reason: {ban.reason}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-600/30 hover:bg-red-600/10"
                    >
                      Unban
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No banned users</p>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 justify-end pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
