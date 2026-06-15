"use client";

import { useRef, useEffect, useState } from "react";
import { PortableText } from "@portabletext/react";
import { ChevronDown, ChevronUp } from "lucide-react";

// All portable text components defined CLIENT-SIDE to avoid server→client function boundary error
const portableTextComponents = {
  marks: {
    link: ({ children, value }: any) => {
      const rel = !value?.href?.startsWith("/") ? "noreferrer noopener" : undefined;
      return (
        <a
          href={value?.href}
          rel={rel}
          className="text-blue-600 hover:underline font-medium"
          target="_blank"
        >
          {children}
        </a>
      );
    },
    strong: ({ children }: any) => (
      <strong className="font-bold text-gray-950">{children}</strong>
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
      <h1 className="text-xl font-bold mb-2 text-gray-950">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-lg font-bold mb-2 text-gray-950">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-md font-semibold mb-1 text-gray-950">{children}</h3>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2 text-gray-600 bg-gray-50 py-1 pr-2 rounded-r">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="list-disc pl-5 mb-2 space-y-1 text-gray-700">{children}</ul>
    ),
    number: ({ children }: any) => (
      <ol className="list-decimal pl-5 mb-2 space-y-1 text-gray-700">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }: any) => <li>{children}</li>,
    number: ({ children }: any) => <li>{children}</li>,
  },
};

interface PostBodyProps {
  body: any;
  isDetailPage?: boolean;
}

const MAX_HEIGHT = 150;

export default function PostBody({ body, isDetailPage = false }: PostBodyProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [expanded, setExpanded] = useState(isDetailPage);

  useEffect(() => {
    if (isDetailPage) {
      setExpanded(true);
      return;
    }
    const el = contentRef.current;
    if (el) {
      // Temporarily expand to measure true height
      el.style.maxHeight = "none";
      const scrollH = el.scrollHeight;
      el.style.maxHeight = "";
      setIsOverflowing(scrollH > MAX_HEIGHT);
    }
  }, [body, isDetailPage]);

  return (
    <div className="relative">
      <div
        ref={contentRef}
        style={!expanded ? { maxHeight: `${MAX_HEIGHT}px`, overflow: "hidden" } : undefined}
        className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
      >
        <PortableText value={body as any} components={portableTextComponents} />
      </div>

      {/* Gradient overlay + expand button when overflowing and collapsed */}
      {isOverflowing && !expanded && (
        <div className="relative">
          <div className="absolute -top-10 left-0 right-0 h-10 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
          <button
            onClick={() => setExpanded(true)}
            className="mt-1 flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
            View full post
          </button>
        </div>
      )}

      {/* Collapse button when expanded and was originally overflowing */}
      {isOverflowing && expanded && !isDetailPage && (
        <button
          onClick={() => setExpanded(false)}
          className="mt-2 flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ChevronUp className="w-4 h-4" />
          Collapse
        </button>
      )}
    </div>
  );
}
