import { Loader2 } from "lucide-react"
import React from 'react';

export function LoadingSpinner({ size = 24, className = "" }: { size?: number, className?: string }) {
  return (
    <Loader2 className={`animate-spin ${className}`} size={size} />
  )
}

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
        <p className="mt-4 text-xl font-medium text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export function ButtonLoader() {
  return (
    <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-current"></div>
  );
}
