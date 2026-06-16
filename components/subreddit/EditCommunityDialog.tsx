"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ImageIcon, Settings } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import Image from "next/image";
import { Button } from "../ui/button";
import { updateCommunity } from "@/action/updateCommunity";
import { useRouter } from "next/navigation";

interface EditCommunityDialogProps {
  subreddit: {
    _id: string;
    title: string;
    description?: string;
    image?: any;
    slug: string;
  };
  currentImageUrl: string | null;
}

export default function EditCommunityDialog({
  subreddit,
  currentImageUrl,
}: EditCommunityDialogProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(subreddit.title);
  const [description, setDescription] = useState(subreddit.description || "");
  const [imagePreview, setImagePreview] = useState<string | null>(
    currentImageUrl
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImageFlag, setRemoveImageFlag] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setRemoveImageFlag(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setRemoveImageFlag(false);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage("Community title is required");
      return;
    }
    setErrorMessage("");

    startTransition(async () => {
      try {
        let imageBase64: string | null = null;
        let fileName: string | null = null;
        let fileType: string | null = null;

        if (imageFile) {
          const reader = new FileReader();
          imageBase64 = await new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(imageFile);
          });
          fileName = imageFile.name;
          fileType = imageFile.type;
        }

        const result = await updateCommunity({
          subredditId: subreddit._id,
          title: title.trim(),
          description: description.trim() || undefined,
          imageBase64,
          imageFilename: fileName,
          imageContentType: fileType,
          removeImage: removeImageFlag,
        });

        if (result.error) {
          setErrorMessage(result.error);
        } else {
          setOpen(false);
          router.refresh();
        }
      } catch (err) {
        console.error("Failed to update community settings", err);
        setErrorMessage("Failed to update community settings");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 text-sm">
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Community Settings</DialogTitle>
          <DialogDescription>
            Modify your community details. Only moderators can change these settings.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="text-red-500 text-sm font-medium">{errorMessage}</div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="edit-name" className="text-sm font-medium text-foreground">
              Community Name
            </label>
            <Input
              id="edit-name"
              placeholder="Name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={21}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="edit-description" className="text-sm font-medium text-foreground">
              Description (optional)
            </label>
            <Textarea
              id="edit-description"
              placeholder="Tell people what your community is about"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={150}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium block text-foreground">Community Logo</label>

            {imagePreview ? (
              <div className="relative w-20 h-20 rounded-full overflow-hidden border mx-auto mb-2 group">
                <Image
                  src={imagePreview}
                  alt="Community Logo Preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute inset-0 bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="edit-community-image"
                  className="flex flex-col items-center justify-center w-full h-20 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-2">
                    <ImageIcon className="w-5 h-5 mb-1 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Upload new image</p>
                  </div>
                  <input
                    id="edit-community-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    ref={fileInputRef}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 transition-colors mt-2"
            disabled={isPending}
          >
            {isPending ? "Saving..." : "Save Settings"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
