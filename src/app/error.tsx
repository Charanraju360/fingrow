"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error boundary triggered:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center space-y-5">
      <div className="w-16 h-16 rounded-3xl bg-fingrow-coral/10 text-fingrow-coral flex items-center justify-center">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-fingrow-midnight">Something went wrong</h1>
        <p className="text-sm text-fingrow-midnight/70 max-w-sm mx-auto">
          An unexpected error occurred. Financial simulation states remain safely preserved.
        </p>
      </div>
      <Button variant="primary" onClick={() => reset()}>
        <RotateCcw className="w-4 h-4 mr-2" />
        <span>Try Again</span>
      </Button>
    </div>
  );
}

