"use client";

import * as React from "react";
import {
  ImageIcon,
  Bold,
  Italic,
  Code,
  Link as LinkIcon,
  Quote,
  List,
  ImagePlus,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { updatePost } from "@/action/updatePost";
import { PortableText } from "@portabletext/react";
import { parseMarkdownToPortableText, portableTextToMarkdown } from "@/lib/markdown";
import { uploadImageAsset } from "@/action/uploadImageAsset";
import { urlFor } from "@/sanity/lib/image";
import Link from "next/link";

const portableTextComponents = {
  marks: {
    link: ({ children, value }: any) => (
      <a
        href={value.href}
        className="text-blue-600 hover:underline font-medium"
        target="_blank"
        rel="noreferrer noopener"
      >
        {children}
      </a>
    ),
    strong: ({ children }: any) => (
      <strong className="font-bold text-foreground">{children}</strong>
    ),
    em: ({ children }: any) => <em className="italic">{children}</em>,
    code: ({ children }: any) => (
      <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-sm text-red-600 border border-border">
        {children}
      </code>
    ),
  },
  block: {
    normal: ({ children }: any) => (
      <p className="mb-2 last:mb-0 leading-relaxed text-foreground">{children}</p>
    ),
    h1: ({ children }: any) => (
      <h1 className="text-xl font-bold mb-2 text-foreground">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-lg font-bold mb-2 text-foreground">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-md font-semibold mb-1 text-foreground">{children}</h3>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-border pl-4 italic my-2 text-muted-foreground bg-muted py-1 pr-2 rounded-r">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="list-disc pl-5 mb-2 space-y-1 text-foreground">
        {children}
      </ul>
    ),
  },
  listItem: {
    bullet: ({ children }: any) => <li>{children}</li>,
  },
  types: {
    image: ({ value }: any) => {
      if (!value?.asset?._ref) return null;
      let imageUrl = "";
      try {
        imageUrl = urlFor(value).url();
      } catch (e) {
        imageUrl = `https://cdn.sanity.io/images/b14dov7f/production/${value.asset._ref
          .replace("image-", "")
          .replace("-jpg", ".jpg")
          .replace("-png", ".png")
          .replace("-webp", ".webp")
          .replace("-gif", ".gif")}`;
      }

      return (
        <div className="relative w-full h-64 my-4 bg-muted/30">
          <Image
            src={imageUrl || "/placeholder.png"}
            alt={value.alt || "Inline post image"}
            fill
            className="object-contain rounded-md p-2"
            unoptimized
          />
        </div>
      );
    },
  },
};

interface EditPostFormProps {
  post: {
    _id: string;
    title: string;
    body?: any;
    flair?: string | null;
    image?: any;
    isNSFW?: boolean;
    isSpoiler?: boolean;
    subreddit?: {
      title?: string | null;
      slug?: string | null | { current?: string | null };
    } | null;
  };
}

const FLAIRS = [
  "Discussion",
  "Question",
  "News",
  "Announcement",
  "Media",
  "Meme",
  "Meta",
];

function EditPostForm({ post }: EditPostFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(post.title || "");
  const [body, setBody] = useState(post.body ? portableTextToMarkdown(post.body) : "");
  const [flair, setFlair] = useState(post.flair || "");
  const [isNSFW, setIsNSFW] = useState(post.isNSFW || false);
  const [isSpoiler, setIsSpoiler] = useState(post.isSpoiler || false);
  const [errorMessage, setErrorMessage] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(
    post.image && post.image.asset?._ref ? urlFor(post.image).url() : null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [isUploadingInline, setIsUploadingInline] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const inlineImageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const router = useRouter();
  const communitySlug =
    (post.subreddit as any)?.slug?.current ||
    (post.subreddit as any)?.slug ||
    "";

  const handleUpdatePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMessage("Post title is required");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

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

      const result = await updatePost({
        postId: post._id,
        title: title.trim(),
        body: body.trim() || "",
        flair: flair || null,
        isNSFW,
        isSpoiler,
        imageBase64: imageBase64,
        imageFilename: fileName,
        imageContentType: fileType,
        removeCurrentImage,
      });

      if (result.error) {
        setErrorMessage(result.error);
      } else {
        router.push(`/c/${communitySlug}/post/${post._id}`);
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to update post", err);
      setErrorMessage("Failed to update post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setImageFile(file);
      setRemoveCurrentImage(false);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setRemoveCurrentImage(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const insertMarkdown = (syntax: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    let replacement = "";
    if (syntax === "bold") {
      replacement = `**${selectedText || "bold text"}**`;
    } else if (syntax === "italic") {
      replacement = `*${selectedText || "italic text"}*`;
    } else if (syntax === "code") {
      replacement = `\`${selectedText || "code"}\``;
    } else if (syntax === "link") {
      replacement = `[${selectedText || "link text"}](https://example.com)`;
    } else if (syntax === "quote") {
      replacement = `\n> ${selectedText || "quote text"}\n`;
    } else if (syntax === "list") {
      replacement = `\n- ${selectedText || "list item"}\n`;
    }

    const newBody =
      text.substring(0, start) + replacement + text.substring(end);
    setBody(newBody);

    // Focus back and set selection
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + replacement.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleInlineImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingInline(true);
    setErrorMessage("");

    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const result = await uploadImageAsset(base64, file.name, file.type);
      if ("error" in result && result.error) {
        setErrorMessage(result.error);
      } else if (result.success && result.assetId) {
        const textarea = textareaRef.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const text = textarea.value;
          const markdownImage = `\n![${file.name}](${result.assetId})\n`;
          const newBody =
            text.substring(0, start) + markdownImage + text.substring(end);
          setBody(newBody);
          setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + markdownImage.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
          }, 0);
        }
      }
    } catch (err) {
      console.error("Failed to upload inline image:", err);
      setErrorMessage("Failed to upload inline image");
    } finally {
      setIsUploadingInline(false);
      if (inlineImageInputRef.current) {
        inlineImageInputRef.current.value = "";
      }
    }
  };

  const previewBlocks = body.trim() ? parseMarkdownToPortableText(body) : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Link
          href={`/c/${communitySlug}/post/${post._id}`}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <h1 className="text-xl font-bold text-foreground">Edit Post</h1>
      </div>

      <form onSubmit={handleUpdatePost} className="space-y-5 bg-card p-6 rounded-lg border border-border shadow-sm">
        {errorMessage && (
          <div className="text-red-500 text-sm font-medium">{errorMessage}</div>
        )}

        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-semibold text-foreground">
            Title
          </label>
          <Input
            id="title"
            name="title"
            placeholder="Title of your post"
            className="w-full focus:ring-2 focus:ring-blue-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={300}
          />
        </div>

        {/* Flair Selector */}
        <div className="space-y-2">
          <label htmlFor="flair" className="text-sm font-semibold text-foreground">
            Post Flair (optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {FLAIRS.map((f) => {
              const flairColors: Record<string, string> = {
                Discussion: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                Question: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
                News: "bg-green-500/10 text-green-600 dark:text-green-400",
                Announcement: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
                Media: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
                Meme: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
                Meta: "bg-muted text-muted-foreground",
              };
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFlair(flair === f ? "" : f)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                    flair === f
                      ? flairColors[f] + " border-current/20 shadow-sm"
                      : "bg-muted border-border text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        {/* NSFW & Spoiler Toggles */}
        <div className="flex gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isNSFW}
              onChange={(e) => setIsNSFW(e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer"
            />
            <span className="text-sm font-medium text-foreground">NSFW</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isSpoiler}
              onChange={(e) => setIsSpoiler(e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer"
            />
            <span className="text-sm font-medium text-foreground">Spoiler</span>
          </label>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="body" className="text-sm font-semibold text-foreground">
              Body (optional)
            </label>
            <div className="flex border border-border rounded-md overflow-hidden text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("write")}
                className={`px-3 py-1 font-medium transition-colors ${
                  activeTab === "write"
                    ? "bg-muted text-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`px-3 py-1 font-medium transition-colors ${
                  activeTab === "preview"
                    ? "bg-muted text-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                Preview
              </button>
            </div>
          </div>

          {activeTab === "write" ? (
            <div className="relative flex flex-col border border-border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
              {/* Markdown Toolbar */}
              <div className="flex flex-wrap items-center gap-1 bg-muted border-b border-border p-1.5 text-muted-foreground">
                <button
                  type="button"
                  onClick={() => insertMarkdown("bold")}
                  className="p-1 hover:bg-card rounded transition-colors"
                  title="Bold"
                >
                  <Bold className="w-4 h-4 text-foreground" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("italic")}
                  className="p-1 hover:bg-card rounded transition-colors"
                  title="Italic"
                >
                  <Italic className="w-4 h-4 text-foreground" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("code")}
                  className="p-1 hover:bg-card rounded transition-colors"
                  title="Inline Code"
                >
                  <Code className="w-4 h-4 text-foreground" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("link")}
                  className="p-1 hover:bg-card rounded transition-colors"
                  title="Link"
                >
                  <LinkIcon className="w-4 h-4 text-foreground" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("quote")}
                  className="p-1 hover:bg-card rounded transition-colors"
                  title="Quote"
                >
                  <Quote className="w-4 h-4 text-foreground" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("list")}
                  className="p-1 hover:bg-card rounded transition-colors"
                  title="Bullet List"
                >
                  <List className="w-4 h-4 text-foreground" />
                </button>
                <div className="w-[1px] h-4 bg-border mx-1"></div>
                <button
                  type="button"
                  onClick={() => inlineImageInputRef.current?.click()}
                  className="p-1 hover:bg-card rounded transition-colors flex items-center gap-1 text-xs"
                  title="Insert Inline Image"
                  disabled={isUploadingInline}
                >
                  {isUploadingInline ? (
                    <Loader2 className="w-4 h-4 text-foreground animate-spin" />
                  ) : (
                    <ImagePlus className="w-4 h-4 text-foreground" />
                  )}
                </button>
              </div>

              {/* Hidden Inline Image input */}
              <input
                type="file"
                accept="image/*"
                onChange={handleInlineImageUpload}
                ref={inlineImageInputRef}
                className="hidden"
              />

              <Textarea
                id="body"
                name="body"
                placeholder="Text (optional, supports basic Markdown formatting and inline images)"
                className="w-full border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none border-t border-border"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                ref={textareaRef}
                rows={10}
              />

              {isUploadingInline && (
                <div className="absolute inset-0 bg-card/60 flex items-center justify-center gap-2 text-sm font-medium text-foreground">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  Uploading image to Sanity...
                </div>
              )}
            </div>
          ) : (
            <div className="w-full min-h-36 border border-border rounded-md p-4 bg-muted/30 prose prose-sm max-w-none text-foreground overflow-auto">
              {previewBlocks.length > 0 ? (
                <PortableText
                  value={previewBlocks as any}
                  components={portableTextComponents}
                />
              ) : (
                <p className="text-muted-foreground italic font-normal">Nothing to preview</p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Cover/Banner Image (optional)</label>

          {imagePreview ? (
            <div className="relative w-full h-64 mx-auto border border-border rounded-lg overflow-hidden bg-muted/30">
              <Image
                src={imagePreview}
                alt="Post preview"
                fill
                className="object-contain"
                unoptimized
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-md transition-colors"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="post-image"
                className="flex flex-col items-center justify-center w-full h-24 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80 transition-colors"
              >
                <div className="flex flex-col items-center justify-center">
                  <ImageIcon className="w-6 h-6 mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Click to upload a cover/banner image
                  </p>
                </div>
                <input
                  id="post-image"
                  name="post-image"
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

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.push(`/c/${communitySlug}/post/${post._id}`)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Saving Changes..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default EditPostForm;
