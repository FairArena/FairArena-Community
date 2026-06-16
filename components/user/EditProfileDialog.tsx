"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings, UserPen } from "lucide-react";
import { useState, useTransition } from "react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { updateProfile } from "@/action/updateProfile";
import { useRouter } from "next/navigation";

interface EditProfileDialogProps {
  userProfile: {
    _id: string;
    username: string;
    displayName?: string;
    bio?: string;
    bannerColor?: string;
    interests?: string[];
  };
}

const BANNERS = [
  { name: "Orange", value: "orange", class: "from-orange-400 to-orange-600" },
  { name: "Blue", value: "blue", class: "from-blue-400 to-blue-600" },
  { name: "Green", value: "green", class: "from-green-400 to-green-600" },
  { name: "Purple", value: "purple", class: "from-purple-400 to-purple-600" },
  { name: "Red", value: "red", class: "from-red-400 to-red-600" },
  { name: "Slate", value: "slate", class: "from-slate-500 to-slate-700" },
];

const AVAILABLE_INTERESTS = [
  "Gaming",
  "Technology",
  "Sports",
  "Movies",
  "Music",
  "Cooking",
  "Science",
  "News",
  "Art",
  "Finance",
  "Anime",
  "Travel"
];

export default function EditProfileDialog({ userProfile }: EditProfileDialogProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState(userProfile.displayName || "");
  const [bio, setBio] = useState(userProfile.bio || "");
  const [bannerColor, setBannerColor] = useState(userProfile.bannerColor || "orange");
  const [interests, setInterests] = useState<string[]>(userProfile.interests || []);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    startTransition(async () => {
      try {
        const result = await updateProfile({
          displayName,
          bio,
          bannerColor,
          interests,
        });

        if (result.error) {
          setErrorMessage(result.error);
        } else {
          setOpen(false);
          router.refresh();
        }
      } catch (err) {
        console.error("Failed to update profile", err);
        setErrorMessage("Failed to update profile");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full flex items-center gap-1.5 text-xs font-semibold">
          <UserPen className="w-3.5 h-3.5" />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Customize your FairArena profile details (display name, bio, and banner style).
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="text-red-500 text-sm font-medium">{errorMessage}</div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4 pr-4">
          <div className="space-y-1">
            <label htmlFor="display-name" className="text-sm font-semibold text-foreground">
              Display Name
            </label>
            <Input
              id="display-name"
              placeholder="e.g. Saksham"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={30}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="bio" className="text-sm font-semibold text-foreground">
              Bio
            </label>
            <Textarea
              id="bio"
              placeholder="Tell people about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              maxLength={200}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground block">
              Profile Banner Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              {BANNERS.map((banner) => (
                <button
                  key={banner.value}
                  type="button"
                  onClick={() => setBannerColor(banner.value)}
                  className={`h-10 rounded-md bg-gradient-to-r ${
                    banner.class
                  } transition-all border-2 relative ${
                    bannerColor === banner.value
                      ? "border-black scale-105 shadow-sm"
                      : "border-transparent opacity-85 hover:opacity-100"
                  }`}
                  title={banner.name}
                >
                  {bannerColor === banner.value && (
                    <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold bg-black/10 rounded-md">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground block">
              Interests / Favorite Topics
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 border border-border rounded-md bg-muted/20">
              {AVAILABLE_INTERESTS.map((interest) => {
                const isSelected = interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${
                      isSelected
                        ? "bg-orange-600 border-orange-600 text-white shadow-sm"
                        : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium"
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
