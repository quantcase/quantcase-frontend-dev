"use client"

import * as React from "react"
import { Tooltip } from "radix-ui"

import { cn } from "@/lib/utils"

const TooltipProvider = Tooltip.Provider
const TooltipRoot = Tooltip.Root
const TooltipTrigger = Tooltip.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof Tooltip.Content>,
  React.ComponentPropsWithoutRef<typeof Tooltip.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <Tooltip.Portal>
    <Tooltip.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 max-w-xs rounded-md bg-zinc-900 dark:bg-zinc-50 px-3 py-2 text-xs text-zinc-50 dark:text-zinc-900 shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </Tooltip.Portal>
))
TooltipContent.displayName = "TooltipContent"

export { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent }
