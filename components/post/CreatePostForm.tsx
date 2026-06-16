"use client";

import * as React from "react";
import {
  ImageIcon,
  Bold,
  Italic,
  Code,
  Link,
  Quote,
  List,
  ImagePlus,
  Loader2,
  Heading1,
  Heading2,
  Heading3,
  ListOrdered,
  Terminal,
  Minus,
  Strikethrough,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { createPost } from "@/action/createPost";
import { PortableText } from "@portabletext/react";
import { parseMarkdownToPortableText } from "@/lib/markdown";
import { uploadImageAsset } from "@/action/uploadImageAsset";
import { urlFor } from "@/sanity/lib/image";

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
    strike: ({ children }: any) => (
      <span className="line-through text-muted-foreground">{children}</span>
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
    codeblock: ({ children }: any) => (
      <pre className="bg-muted p-3 my-2 rounded-md font-mono text-xs overflow-x-auto border border-border text-red-600">
        <code>{children}</code>
      </pre>
    ),
    hr: () => <hr className="my-4 border-t border-border" />,
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="list-disc pl-5 mb-2 space-y-1 text-foreground">
        {children}
      </ul>
    ),
    number: ({ children }: any) => (
      <ol className="list-decimal pl-5 mb-2 space-y-1 text-foreground">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }: any) => <li>{children}</li>,
    number: ({ children }: any) => <li>{children}</li>,
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

const FLAIR_OPTIONS = [
  "Discussion",
  "Question",
  "News",
  "Announcement",
  "Meme",
  "Meta",
];

function CreatePostForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [postType, setPostType] = useState<"text" | "link">("text");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [flair, setFlair] = useState("");
  const [isNSFW, setIsNSFW] = useState(false);
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [isUploadingInline, setIsUploadingInline] = useState(false);
  const [keywordsInput, setKeywordsInput] = useState("");
  const [customFlair, setCustomFlair] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const inlineImageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const rawSubreddit = searchParams.get("subreddit") || searchParams.get("community");
  const subreddit = rawSubreddit ? rawSubreddit.split("/")[0] : null;

  if (!subreddit) {
    return (
      <div className="text-center p-4">
        <p>Please select a community first</p>
      </div>
    );
  }

  const handleCreatePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMessage("Post title is required");
      return;
    }

    if (postType === "link" && !linkUrl.trim()) {
      setErrorMessage("Link URL is required for link posts");
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

      const keywords = keywordsInput
        ? keywordsInput.split(",").map(k => k.trim()).filter(Boolean)
        : [];

      const result = await createPost({
        title: title.trim(),
        subredditSlug: subreddit,
        body: postType === "text" ? (body.trim() || undefined) : undefined,
        linkUrl: postType === "link" ? linkUrl.trim() : undefined,
        postType,
        flair: flair || undefined,
        isNSFW,
        isSpoiler,
        imageBase64: imageBase64,
        imageFilename: fileName,
        imageContentType: fileType,
        keywords: keywords,
      });

      resetForm();

      if ("error" in result && result.error) {
        setErrorMessage(result.error);
      } else {
        router.push(`/c/${subreddit}`);
      }
    } catch (err) {
      console.error("Failed to create post", err);
      setErrorMessage("Failed to create post");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setBody("");
    setLinkUrl("");
    setFlair("");
    setIsNSFW(false);
    setIsSpoiler(false);
    setErrorMessage("");
    setImagePreview(null);
    setImageFile(null);
    setKeywordsInput("");
    setCustomFlair("");
    setActiveTab("write");
    setPostType("text");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
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
    } else if (syntax === "strikethrough") {
      replacement = `~~${selectedText || "strikethrough text"}~~`;
    } else if (syntax === "link") {
      replacement = `[${selectedText || "link text"}](https://example.com)`;
    } else if (syntax === "quote") {
      replacement = `\n> ${selectedText || "quote text"}\n`;
    } else if (syntax === "list") {
      replacement = `\n- ${selectedText || "list item"}\n`;
    } else if (syntax === "numlist") {
      replacement = `\n1. ${selectedText || "list item"}\n`;
    } else if (syntax === "h1") {
      replacement = `\n# ${selectedText || "Heading 1"}\n`;
    } else if (syntax === "h2") {
      replacement = `\n## ${selectedText || "Heading 2"}\n`;
    } else if (syntax === "h3") {
      replacement = `\n### ${selectedText || "Heading 3"}\n`;
    } else if (syntax === "codeblock") {
      replacement = `\n\`\`\`\n${selectedText || "code block"}\n\`\`\`\n`;
    } else if (syntax === "hr") {
      replacement = `\n---\n`;
    }

    const newBody = text.substring(0, start) + replacement + text.substring(end);
    setBody(newBody);

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
          const newBody = text.substring(0, start) + markdownImage + text.substring(end);
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
    <div className="mx-auto max-w-3xl px-4">
      <form onSubmit={handleCreatePost} className="space-y-4 mt-2">
        {errorMessage && (
          <div className="text-red-500 text-sm bg-red-50 p-3 rounded border border-red-200">
            {errorMessage}
          </div>
        )}



        {/* Title */}
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Title
          </label>
          <Input
            id="title"
            name="title"
            placeholder="Title of your post"
            className="w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={300}
          />
        </div>

        {/* Text Post Content */}
        {postType === "text" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="body" className="text-sm font-medium">
                Body (optional)
              </label>
              <div className="flex border border-border rounded-md overflow-hidden text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab("write")}
                  className={`px-3 py-1 font-medium transition-colors ${
                    activeTab === "write"
                      ? "bg-muted text-foreground"
                      : "bg-background text-muted-foreground hover:text-foreground"
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
                      : "bg-background text-muted-foreground hover:text-foreground"
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
                    className="p-1 hover:bg-muted-foreground/20 rounded transition-colors"
                    title="Bold"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("italic")}
                    className="p-1 hover:bg-muted-foreground/20 rounded transition-colors"
                    title="Italic"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("strikethrough")}
                    className="p-1 hover:bg-muted-foreground/20 rounded transition-colors"
                    title="Strikethrough"
                  >
                    <Strikethrough className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("code")}
                    className="p-1 hover:bg-muted-foreground/20 rounded transition-colors"
                    title="Inline Code"
                  >
                    <Code className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("link")}
                    className="p-1 hover:bg-muted-foreground/20 rounded transition-colors"
                    title="Link"
                  >
                    <Link className="w-4 h-4" />
                  </button>
                  <div className="w-[1px] h-4 bg-border mx-1"></div>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("h1")}
                    className="p-1 hover:bg-muted-foreground/20 rounded transition-colors"
                    title="Heading 1"
                  >
                    <Heading1 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("h2")}
                    className="p-1 hover:bg-muted-foreground/20 rounded transition-colors"
                    title="Heading 2"
                  >
                    <Heading2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("h3")}
                    className="p-1 hover:bg-muted-foreground/20 rounded transition-colors"
                    title="Heading 3"
                  >
                    <Heading3 className="w-4 h-4" />
                  </button>
                  <div className="w-[1px] h-4 bg-border mx-1"></div>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("quote")}
                    className="p-1 hover:bg-muted-foreground/20 rounded transition-colors"
                    title="Quote"
                  >
                    <Quote className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("list")}
                    className="p-1 hover:bg-muted-foreground/20 rounded transition-colors"
                    title="Bullet List"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("numlist")}
                    className="p-1 hover:bg-muted-foreground/20 rounded transition-colors"
                    title="Numbered List"
                  >
                    <ListOrdered className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("codeblock")}
                    className="p-1 hover:bg-muted-foreground/20 rounded transition-colors"
                    title="Code Block"
                  >
                    <Terminal className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("hr")}
                    className="p-1 hover:bg-muted-foreground/20 rounded transition-colors"
                    title="Horizontal Line"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="w-[1px] h-4 bg-border mx-1"></div>
                  <button
                    type="button"
                    onClick={() => inlineImageInputRef.current?.click()}
                    className="p-1 hover:bg-muted-foreground/20 rounded transition-colors flex items-center gap-1 text-xs"
                    title="Insert Inline Image"
                    disabled={isUploadingInline}
                  >
                    {isUploadingInline ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ImagePlus className="w-4 h-4" />
                    )}
                  </button>
                </div>

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
                  placeholder="Text (optional, supports basic Markdown formatting)"
                  className="w-full border-0 focus:ring-0 rounded-none"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  ref={textareaRef}
                  rows={8}
                />

                {isUploadingInline && (
                  <div className="absolute inset-0 bg-background/60 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                    Uploading image...
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full min-h-36 border border-border rounded-md p-4 bg-muted/50 prose prose-sm max-w-none text-foreground overflow-auto">
                {previewBlocks.length > 0 ? (
                  <PortableText
                    value={previewBlocks as any}
                    components={portableTextComponents}
                  />
                ) : (
                  <p className="text-muted-foreground italic">Nothing to preview</p>
                )}
              </div>
            )}
          </div>
        )}



        {/* Flair Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Flair (optional)</label>
          <div className="flex flex-wrap gap-2">
            {FLAIR_OPTIONS.map((option) => {
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
                  key={option}
                  type="button"
                  onClick={() => {
                    const nextFlair = flair === option ? "" : option;
                    setFlair(nextFlair);
                    setCustomFlair("");
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    flair === option
                      ? flairColors[option] + " shadow-md border border-current/20"
                      : "bg-muted text-foreground hover:bg-muted-foreground/20"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
          <Input
            placeholder="Or type custom flair..."
            value={customFlair}
            onChange={(e) => {
              const val = e.target.value;
              setCustomFlair(val);
              setFlair(val);
            }}
            className="w-full max-w-xs mt-2 text-sm"
          />
        </div>

        {/* Spoiler Toggle */}
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isSpoiler}
              onChange={(e) => setIsSpoiler(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">Spoiler</span>
          </label>
        </div>

        {/* Keywords Input */}
        <div className="space-y-2">
          <label htmlFor="keywords" className="text-sm font-medium">
            Keywords / Tags (comma separated, e.g. gaming, review, meta)
          </label>
          <Input
            id="keywords"
            name="keywords"
            placeholder="e.g. gameplay, guide, update"
            className="w-full"
            value={keywordsInput}
            onChange={(e) => setKeywordsInput(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Add keywords to boost search discovery and SEO visibility.
          </p>
        </div>

        {/* Cover Image */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Cover/Banner Image (optional)</label>
          {imagePreview ? (
            <div className="relative w-full h-64 mx-auto">
              <Image
                src={imagePreview}
                alt="Post preview"
                fill
                className="object-contain"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="post-image"
                className="flex flex-col items-center justify-center w-full h-24 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80"
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

        <Button
          type="submit"
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2"
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Post"}
        </Button>
      </form>
    </div>
  );
}

export default CreatePostForm;
