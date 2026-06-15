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
      <strong className="font-bold text-gray-955">{children}</strong>
    ),
    em: ({ children }: any) => <em className="italic">{children}</em>,
    code: ({ children }: any) => (
      <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-sm text-red-600 border border-gray-200">
        {children}
      </code>
    ),
  },
  block: {
    normal: ({ children }: any) => (
      <p className="mb-2 last:mb-0 leading-relaxed text-gray-800">{children}</p>
    ),
    h1: ({ children }: any) => (
      <h1 className="text-xl font-bold mb-2 text-gray-955">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-lg font-bold mb-2 text-gray-955">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-md font-semibold mb-1 text-gray-955">{children}</h3>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2 text-gray-600 bg-gray-50 py-1 pr-2 rounded-r">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="list-disc pl-5 mb-2 space-y-1 text-gray-800">
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
      // We build a pseudo image URL from ref for local preview, or use the direct sanity URL
      const imageUrl = value.asset._ref.startsWith("image-")
        ? `https://cdn.sanity.io/images/b14dov7f/production/${value.asset._ref
            .replace("image-", "")
            .replace("-jpg", ".jpg")
            .replace("-png", ".png")
            .replace("-webp", ".webp")
            .replace("-gif", ".gif")}`
        : "";

      return (
        <div className="relative w-full h-64 my-4 bg-gray-100/30">
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

function CreatePostForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [isUploadingInline, setIsUploadingInline] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const inlineImageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const subreddit = searchParams.get("subreddit");

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

      const result = await createPost({
        title: title.trim(),
        subredditSlug: subreddit,
        body: body.trim() || undefined,
        imageBase64: imageBase64,
        imageFilename: fileName,
        imageContentType: fileType,
      });

      resetForm();
      console.log("Finished creating post", result);

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
    setErrorMessage("");
    setImagePreview(null);
    setImageFile(null);
    setActiveTab("write");
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
          // Markdown format: ![alt](id)
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
    <div className="mx-auto max-w-3xl px-4">
      <form onSubmit={handleCreatePost} className="space-y-4 mt-2">
        {errorMessage && (
          <div className="text-red-500 text-sm">{errorMessage}</div>
        )}

        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="body" className="text-sm font-medium">
              Body (optional)
            </label>
            <div className="flex border border-gray-200 rounded-md overflow-hidden text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("write")}
                className={`px-3 py-1 font-medium transition-colors ${
                  activeTab === "write"
                    ? "bg-gray-100 text-gray-900"
                    : "bg-white text-gray-500 hover:text-gray-900"
                }`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`px-3 py-1 font-medium transition-colors ${
                  activeTab === "preview"
                    ? "bg-gray-100 text-gray-900"
                    : "bg-white text-gray-500 hover:text-gray-900"
                }`}
              >
                Preview
              </button>
            </div>
          </div>

          {activeTab === "write" ? (
            <div className="relative flex flex-col border border-gray-200 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
              {/* Markdown Toolbar */}
              <div className="flex flex-wrap items-center gap-1 bg-gray-50 border-b border-gray-200 p-1.5 text-gray-500">
                <button
                  type="button"
                  onClick={() => insertMarkdown("bold")}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Bold"
                >
                  <Bold className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("italic")}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Italic"
                >
                  <Italic className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("code")}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Inline Code"
                >
                  <Code className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("link")}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Link"
                >
                  <Link className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("quote")}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Quote"
                >
                  <Quote className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("list")}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Bullet List"
                >
                  <List className="w-4 h-4 text-gray-700" />
                </button>
                <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
                <button
                  type="button"
                  onClick={() => inlineImageInputRef.current?.click()}
                  className="p-1 hover:bg-gray-200 rounded transition-colors flex items-center gap-1 text-xs"
                  title="Insert Inline Image"
                  disabled={isUploadingInline}
                >
                  {isUploadingInline ? (
                    <Loader2 className="w-4 h-4 text-gray-700 animate-spin" />
                  ) : (
                    <ImagePlus className="w-4 h-4 text-gray-700" />
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
                className="w-full border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none border-t border-gray-200"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                ref={textareaRef}
                rows={8}
              />

              {isUploadingInline && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center gap-2 text-sm font-medium text-gray-600">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  Uploading image to Sanity...
                </div>
              )}
            </div>
          ) : (
            <div className="w-full min-h-36 border border-gray-200 rounded-md p-4 bg-gray-50/50 prose prose-sm max-w-none text-gray-700 overflow-auto">
              {previewBlocks.length > 0 ? (
                <PortableText
                  value={previewBlocks as any}
                  components={portableTextComponents}
                />
              ) : (
                <p className="text-gray-400 italic">Nothing to preview</p>
              )}
            </div>
          )}
        </div>

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
                className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center">
                  <ImageIcon className="w-6 h-6 mb-2 text-gray-400" />
                  <p className="text-xs text-gray-500">
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
          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Post"}
        </Button>
      </form>
    </div>
  );
}

export default CreatePostForm;
