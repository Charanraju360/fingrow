import React from "react";
import { ArrowLeft, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center space-y-5">
      <div className="w-16 h-16 rounded-3xl bg-fingrow-emerald/10 text-fingrow-emerald flex items-center justify-center">
        <Compass className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold text-fingrow-midnight">Page Not Found</h1>
        <p className="text-sm text-fingrow-midnight/70 max-w-sm mx-auto">
          The financial page, course, or classroom you are searching for does not exist or has been relocated.
        </p>
      </div>
      <a href="/">
        <Button variant="primary">
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span>Return Home</span>
        </Button>
      </a>
    </div>
  );
}

