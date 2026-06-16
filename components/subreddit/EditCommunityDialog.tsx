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
    rules?: Array<{ title: string; description?: string }>;
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
  const [rules, setRules] = useState<Array<{ title: string; description?: string }>>(
    subreddit.rules || []
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImageFlag, setRemoveImageFlag] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const addRule = () => {
    setRules((prev) => [...prev, { title: "", description: "" }]);
  };

  const removeRule = (index: number) => {
    setRules((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRuleChange = (
    index: number,
    field: "title" | "description",
    value: string
  ) => {
    setRules((prev) =>
      prev.map((rule, i) => (i === index ? { ...rule, [field]: value } : rule))
    );
  };

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
          rules: rules.filter((r) => r.title.trim() !== ""),
        });

        if (result.error) {
          setErrorMessage(result.error);
        } else {
          setOpen(false);
          router.refresh();
          window.location.reload();
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
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
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

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Community Rules
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRule}
                className="text-xs h-7 py-0 px-2 rounded"
              >
                + Add Rule
              </Button>
            </div>
            
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {rules.length > 0 ? (
                rules.map((rule, index) => (
                  <div
                    key={index}
                    className="p-3 border border-border rounded-lg bg-muted/20 relative space-y-2"
                  >
                    <button
                      type="button"
                      onClick={() => removeRule(index)}
                      className="absolute top-2 right-2 text-xs text-red-500 hover:text-red-700 font-semibold"
                    >
                      Delete
                    </button>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Rule Title
                      </label>
                      <Input
                        placeholder="e.g. Keep posts relevant"
                        value={rule.title}
                        onChange={(e) =>
                          handleRuleChange(index, "title", e.target.value)
                        }
                        className="h-8 text-xs"
                        required
                        maxLength={60}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Rule Description (optional)
                      </label>
                      <Textarea
                        placeholder="Provide details about the rule..."
                        value={rule.description || ""}
                        onChange={(e) =>
                          handleRuleChange(index, "description", e.target.value)
                        }
                        className="text-xs"
                        rows={2}
                        maxLength={200}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2 italic">
                  No rules defined. Add rules to guide community members.
                </p>
              )}
            </div>
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
