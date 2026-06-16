"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home, AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-4 text-center">
      <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100 text-red-600 animate-pulse">
        <AlertTriangle className="h-12 w-12" />
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        Oops! Something went wrong
      </h1>
      
      <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
        An unexpected error occurred while loading this page. Our team has been notified. You can try reloading or return home.
      </p>

      {error.digest && (
        <p className="mt-2 text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
          Error Digest: {error.digest}
        </p>
      )}

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-card px-6 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:bg-muted transition-colors"
        >
          <Home className="h-4 w-4" />
          Go to Home
        </Link>
      </div>
    </div>
  );
}
