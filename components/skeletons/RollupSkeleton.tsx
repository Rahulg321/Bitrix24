"use client";

import React from "react";

export function RollupSkeleton({ message = "Performing Rollup..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-white">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-lg font-medium">{message}</p>
    </div>
  );
}
