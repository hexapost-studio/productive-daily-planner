"use client"

import { cn } from "@/lib/utils"

interface ProgressProps {
  value?: number
  className?: string
  "aria-label"?: string
  "data-slot"?: string
}

function Progress({ value = 0, className, "aria-label": ariaLabel, ...props }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel ?? `${clamped}%`}
      data-slot="progress"
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-muted", className)}
      {...props}
    >
      <div
        data-slot="progress-indicator"
        className="h-full bg-primary transition-all duration-300"
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}

export { Progress }
