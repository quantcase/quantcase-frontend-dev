import { ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";

export type TaskStatus = "pending" | "done" | "overdue";

export interface TaskItem {
  id: string;
  label: string;
  status: TaskStatus;
  meta?: string;
}

interface TodaysTasksProps {
  tasks: TaskItem[];
  className?: string;
}

export function TodaysTasks({ tasks, className }: TodaysTasksProps) {
  return (
    <div className={cn("rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2 flex flex-col", className)}>
      {/* Panel header */}
      <div className="px-2 pt-1 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListTodo className="size-3.5 text-[#888888]" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172B", textTransform: "uppercase", letterSpacing: "0.01em" }}>
            Today&apos;s Tasks
          </span>
        </div>
      </div>

      {/* Inner white box */}
      <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)] flex flex-col divide-y divide-[#E2E2E2] overflow-hidden">
        {tasks.map((task) => {
          const isDone = task.status === "done";
          const isOverdue = task.status === "overdue";
          return (
            <div
              key={task.id}
              className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-[#F5F5F5] transition-colors"
            >
              {/* Checkbox */}
              <div
                className={cn(
                  "flex-shrink-0 size-4 rounded border flex items-center justify-center transition-colors",
                  isDone
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-[#E2E2E2] bg-white"
                )}
              >
                {isDone && (
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                    <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>

              {/* Label */}
              <p
                className={cn("flex-1 text-[13px]", isDone && "line-through")}
                style={{ color: isDone ? "#888888" : "#0F172B" }}
              >
                {task.label}
              </p>

              {/* Meta / status badge */}
              {task.meta && (
                <span
                  className="flex-shrink-0 text-[10px] font-semibold uppercase tracking-wider rounded-sm px-1.5 py-0.5"
                  style={{
                    background: isOverdue ? "#FEF3F2" : isDone ? "#F0FDF4" : "#F5F5F5",
                    color: isOverdue ? "#dc2626" : isDone ? "#059669" : "#888888",
                    border: isOverdue ? "1px solid #fecaca" : isDone ? "1px solid #bbf7d0" : "1px solid #E2E2E2",
                  }}
                >
                  {task.meta}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
