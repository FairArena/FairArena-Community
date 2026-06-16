"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash2, Edit2, ArrowUp, ArrowDown, Check, X } from "lucide-react";
import { addFlair, editFlair, deleteFlair, reorderFlairs } from "@/action/flairActions";
import { toast } from "sonner";

interface Flair {
  _id: string;
  name: string;
  color: string;
  order: number;
}

interface CommunityFlairsProps {
  subredditId: string;
  flairs: Flair[];
  userRole?: "admin" | "moderator";
}

export function CommunityFlairs({
  subredditId,
  flairs,
  userRole,
}: CommunityFlairsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFlairId, setEditingFlairId] = useState<string | null>(null);

  // Form state for new flair
  const [newFlairName, setNewFlairName] = useState("");
  const [newFlairColor, setNewFlairColor] = useState("#ea580c");

  // Form state for editing
  const [editFlairName, setEditFlairName] = useState("");
  const [editFlairColor, setEditFlairColor] = useState("#ea580c");

  // Sorted flairs by order
  const [sortedFlairs, setSortedFlairs] = useState<Flair[]>(
    [...flairs].sort((a, b) => a.order - b.order)
  );

  if (userRole !== "admin") {
    return null;
  }

  const handleAddFlair = async () => {
    if (!newFlairName.trim()) {
      toast.error("Flair name is required");
      return;
    }

    setIsLoading(true);
    try {
      const maxOrder = sortedFlairs.length > 0
        ? Math.max(...sortedFlairs.map((f) => f.order))
        : 0;

      await addFlair(subredditId, {
        name: newFlairName.trim(),
        color: newFlairColor,
        order: maxOrder + 1,
      });

      toast.success("Flair added successfully");
      setNewFlairName("");
      setNewFlairColor("#ea580c");
      setShowAddForm(false);
    } catch (error) {
      console.error("Failed to add flair:", error);
      toast.error("Failed to add flair");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditFlair = async (flairId: string) => {
    if (!editFlairName.trim()) {
      toast.error("Flair name is required");
      return;
    }

    setIsLoading(true);
    try {
      await editFlair(subredditId, flairId, {
        name: editFlairName.trim(),
        color: editFlairColor,
      });

      toast.success("Flair updated successfully");
      setEditingFlairId(null);
      setEditFlairName("");
      setEditFlairColor("#ea580c");
    } catch (error) {
      console.error("Failed to edit flair:", error);
      toast.error("Failed to edit flair");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFlair = async (flairId: string) => {
    if (!confirm("Are you sure you want to delete this flair?")) return;

    setIsLoading(true);
    try {
      await deleteFlair(subredditId, flairId);
      toast.success("Flair deleted");
    } catch (error) {
      console.error("Failed to delete flair:", error);
      toast.error("Failed to delete flair");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;

    const newFlairs = [...sortedFlairs];
    [newFlairs[index - 1], newFlairs[index]] = [newFlairs[index], newFlairs[index - 1]];

    // Update order values
    const orderedFlairs = newFlairs.map((f, i) => ({ ...f, order: i }));
    setSortedFlairs(orderedFlairs);

    setIsLoading(true);
    try {
      await reorderFlairs(subredditId, orderedFlairs);
      toast.success("Flair order updated");
    } catch (error) {
      console.error("Failed to reorder flairs:", error);
      toast.error("Failed to reorder flairs");
      setSortedFlairs(sortedFlairs); // Revert on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === sortedFlairs.length - 1) return;

    const newFlairs = [...sortedFlairs];
    [newFlairs[index], newFlairs[index + 1]] = [newFlairs[index + 1], newFlairs[index]];

    // Update order values
    const orderedFlairs = newFlairs.map((f, i) => ({ ...f, order: i }));
    setSortedFlairs(orderedFlairs);

    setIsLoading(true);
    try {
      await reorderFlairs(subredditId, orderedFlairs);
      toast.success("Flair order updated");
    } catch (error) {
      console.error("Failed to reorder flairs:", error);
      toast.error("Failed to reorder flairs");
      setSortedFlairs(sortedFlairs); // Revert on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-bold text-foreground">Post Flairs</h3>
        <Button
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          className="gap-2 bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="w-4 h-4" />
          Add Flair
        </Button>
      </div>

      {/* Add Flair Form */}
      {showAddForm && (
        <div className="p-4 border-b border-border bg-muted/50 space-y-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Flair Name
            </label>
            <Input
              value={newFlairName}
              onChange={(e) => setNewFlairName(e.target.value)}
              placeholder="e.g., OC, Help Wanted"
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Color
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={newFlairColor}
                onChange={(e) => setNewFlairColor(e.target.value)}
                className="w-12 h-10 rounded border border-border cursor-pointer"
              />
              <Input
                value={newFlairColor}
                onChange={(e) => setNewFlairColor(e.target.value)}
                placeholder="#ea580c"
                className="flex-1"
                maxLength={7}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleAddFlair}
              disabled={isLoading}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Flair
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddForm(false);
                setNewFlairName("");
                setNewFlairColor("#ea580c");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Flairs List */}
      {sortedFlairs.length > 0 ? (
        <div className="divide-y divide-border max-h-96 overflow-y-auto">
          {sortedFlairs.map((flair, index) => (
            <div key={flair._id} className="p-4 hover:bg-muted/50 transition-colors">
              {editingFlairId === flair._id ? (
                // Edit Mode
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Flair Name
                    </label>
                    <Input
                      value={editFlairName}
                      onChange={(e) => setEditFlairName(e.target.value)}
                      placeholder="e.g., OC, Help Wanted"
                      maxLength={50}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Color
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={editFlairColor}
                        onChange={(e) => setEditFlairColor(e.target.value)}
                        className="w-12 h-10 rounded border border-border cursor-pointer"
                      />
                      <Input
                        value={editFlairColor}
                        onChange={(e) => setEditFlairColor(e.target.value)}
                        placeholder="#ea580c"
                        className="flex-1"
                        maxLength={7}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleEditFlair(flair._id)}
                      disabled={isLoading}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white gap-1"
                    >
                      <Check className="w-4 h-4" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingFlairId(null);
                        setEditFlairName("");
                        setEditFlairColor("#ea580c");
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-4 h-4 rounded flex-shrink-0 border border-border"
                      style={{ backgroundColor: flair.color }}
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">{flair.name}</p>
                      <p className="text-xs text-muted-foreground">{flair.color}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Order Buttons */}
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMoveUp(index)}
                        disabled={isLoading || index === 0}
                        className="p-1 h-8 w-8"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMoveDown(index)}
                        disabled={isLoading || index === sortedFlairs.length - 1}
                        className="p-1 h-8 w-8"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Edit Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingFlairId(flair._id);
                        setEditFlairName(flair.name);
                        setEditFlairColor(flair.color);
                      }}
                      disabled={isLoading}
                      className="p-1 h-8 w-8"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>

                    {/* Delete Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteFlair(flair._id)}
                      disabled={isLoading}
                      className="p-1 h-8 w-8 text-red-600 border-red-600/30 hover:bg-red-600/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No flairs created yet. Add one to get started!
          </p>
        </div>
      )}
    </div>
  );
}
