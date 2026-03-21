import { cn } from "@/lib/utils";
import type { WealthModel, ModelType } from "@/types/wealthos";

interface ModelCardProps {
  model: WealthModel;
  className?: string;
  action?: React.ReactNode;
}

const modelTypeStyles: Record<ModelType, string> = {
  equity: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  debt: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  hybrid: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  structured: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  pms: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  aif: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
};

export function ModelCard({ model, className, action }: ModelCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 leading-snug">{model.name}</p>
        <span className={cn("shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", modelTypeStyles[model.model_type])}>
          {model.model_type.toUpperCase()}
        </span>
      </div>
      {model.description && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-3">{model.description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
