import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Canonical Badge / Chip — the single chip primitive for the app.
 *
 * Three families of variants (audit consolidation):
 *  - shadcn legacy: default | secondary | destructive | outline | ghost | link
 *  - semantic data: up | down (alias crit) | warn | info | muted   (token-driven)
 *
 * Semantic colors are exclusive: green = positive, red = negative,
 * amber = caution ONLY, blue = state. STRONG/ACHIEVED → `up` (green),
 * never `warn`. All colors resolve from --qc-* tokens via @theme utilities.
 */
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-sm border border-transparent px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden h-6",
  {
    variants: {
      variant: {
        // shadcn legacy (retokened — was hardcoded #F5F5F5/#90A1B9)
        default: "bg-secondary text-ink-3 [a&]:hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline",

        // semantic data variants (token-driven) — positive / negative / caution / state
        up: "bg-up-soft text-up border-up/25",
        down: "bg-down-soft text-down border-down/25",
        crit: "bg-down-soft text-down border-down/25", // alias of down (ds legacy name)
        warn: "bg-warn-soft text-warn border-warn/25",
        info: "bg-blue-soft text-blue border-blue/25",
        muted: "bg-transparent text-ink-3 border-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
