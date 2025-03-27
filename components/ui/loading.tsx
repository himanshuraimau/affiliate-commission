import { Loader2 } from "lucide-react"

export function LoadingSpinner({ size = 24, className = "" }: { size?: number, className?: string }) {
  return (
    <Loader2 className={`animate-spin ${className}`} size={size} />
  )
}

export function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSpinner size={32} />
    </div>
  )
}
