"use client";

import { useState } from "react";
import { Eye } from "lucide-react";

interface MediaRevealWrapperProps {
  isSpoiler?: boolean;
  children: React.ReactNode;
  hasMedia?: boolean;
}

export default function MediaRevealWrapper({
  isSpoiler = false,
  children,
  hasMedia = true,
}: MediaRevealWrapperProps) {
  const [revealed, setRevealed] = useState(false);

  if (!isSpoiler || revealed || !hasMedia) {
    return <>{children}</>;
  }

  const bgColor = "bg-slate-950/20 border-slate-700/50";
  const iconColor = "text-slate-500";
  const iconBg = "bg-slate-100 dark:bg-slate-900";

  return (
    <div className={`relative rounded-md overflow-hidden border ${bgColor} my-3`}>
      {/* Blurred preview of the children */}
      <div className="blur-lg select-none pointer-events-none opacity-20 scale-[0.98]">
        {children}
      </div>

      {/* Warning Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
        <div className={`p-4 rounded-full ${iconBg} mb-4 shadow-lg`}>
          <Eye className={`w-8 h-8 ${iconColor}`} />
        </div>
        <p className="text-lg font-bold text-foreground">
          Spoiler
        </p>
        <p className="text-sm text-muted-foreground mt-2 max-w-[280px]">
          This content contains spoilers. Click to view.
        </p>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setRevealed(true);
          }}
          className="mt-5 px-6 py-2 font-bold rounded-lg transition-all shadow-lg text-white bg-slate-600 hover:bg-slate-700"
        >
          View Content
        </button>
      </div>
    </div>
  );
}
