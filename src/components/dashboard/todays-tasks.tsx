"use client";

import React, { useState } from "react";
import { MonoLabel, LimeCountPip } from "@/components/ds";
import { CheckSquare, Plus, Check } from "lucide-react";

type TaskStatus = "pending" | "done" | "overdue";

export interface TaskItem {
  id: string;
  label: string;
  status: TaskStatus;
  meta?: string;
}

interface TodaysTasksProps {
  tasks: TaskItem[];
  style?: React.CSSProperties;
  className?: string;
}

const BADGE_STYLE: Record<TaskStatus, React.CSSProperties> = {
  pending: { background: "transparent", color: "var(--qc-ink-3)", border: "none" },
  overdue: { background: "var(--qc-down-soft)", color: "var(--qc-down)", border: "1px solid var(--qc-down-soft)" },
  done:    { background: "var(--qc-up-soft)",   color: "var(--qc-up)",   border: "1px solid var(--qc-up-soft)" },
};

export function TodaysTasks({ tasks: initialTasks, style, className = "" }: TodaysTasksProps) {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [newDraft, setNewDraft] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  function toggleTask(id: string) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (t.status === "done") {
          return {
            ...t,
            status: t.meta?.startsWith("OVERDUE") ? "overdue" : "pending",
          };
        }
        return {
          ...t,
          status: "done",
          meta: "DONE · " + new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }),
        };
      })
    );
  }

  function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newDraft.trim()) return;
    const newTask: TaskItem = {
      id: String(Date.now()),
      label: newDraft.trim(),
      status: "pending",
      meta: "NEW",
    };
    setTasks((prev) => [newTask, ...prev]);
    setNewDraft("");
    setIsAdding(false);
  }

  const pendingCount = tasks.filter((t) => t.status !== "done").length;

  return (
    <div
      className={`rounded-[10px] p-2 flex flex-col h-full w-full min-w-0 ${className}`}
      style={{
        border: "1px solid var(--qc-hair)",
        background: "var(--qc-section)",
        ...style,
      }}
    >
      {/* Header — identical layout & height to WhoToCallToday */}
      <div className="px-2 pt-1 pb-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <CheckSquare className="size-3.5" style={{ color: "var(--qc-ink-2)" }} />
          <MonoLabel size={11} tracking="0.16em" color="var(--qc-ink)">
            TODAY&apos;S TASKS
          </MonoLabel>
          <LimeCountPip count={pendingCount} />
        </div>

        <button
          onClick={() => setIsAdding((v) => !v)}
          className="size-6 rounded-md flex items-center justify-center transition-colors cursor-pointer hover:opacity-90"
          style={{
            background: "var(--qc-lime)",
            color: "var(--qc-ink)",
            border: "1px solid var(--qc-lime-edge)",
          }}
          title="Add task"
          aria-label="Add task"
        >
          <Plus className="size-3.5" />
        </button>
      </div>

      {/* Content — white inner card perfectly matched with WhoToCallToday */}
      <div
        className="rounded-[10px] overflow-hidden flex-1 flex flex-col justify-between"
        style={{ background: "var(--qc-card)" }}
      >
        <div className="divide-y divide-[var(--qc-hair-2)] flex-1 flex flex-col">
          {/* Inline quick add field if active */}
          {isAdding && (
            <form onSubmit={handleAddTask} className="p-2.5 bg-[var(--qc-surface)] border-b border-[var(--qc-hair)] flex gap-2">
              <input
                type="text"
                autoFocus
                placeholder="What needs to be done today?"
                value={newDraft}
                onChange={(e) => setNewDraft(e.target.value)}
                className="flex-1 text-xs px-2 py-1 rounded border border-[var(--qc-hair)] bg-white text-[var(--qc-ink)] focus:outline-none"
              />
              <button
                type="submit"
                className="px-2.5 py-1 text-[11px] font-medium rounded bg-[var(--qc-ink)] text-white"
              >
                Add
              </button>
            </form>
          )}

          {tasks.map((task) => {
            const isDone = task.status === "done";
            return (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className="group flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[rgba(0,0,0,0.015)] transition-colors flex-1"
              >
                {/* Custom Checkbox */}
                <div
                  className="size-4 rounded flex items-center justify-center shrink-0 transition-all"
                  style={{
                    border: isDone ? "1px solid var(--qc-up)" : "1px solid var(--qc-hair-strong)",
                    background: isDone ? "var(--qc-up)" : "#FFFFFF",
                    color: "#FFFFFF",
                  }}
                >
                  {isDone && <Check className="size-3 stroke-[3]" />}
                </div>

                {/* Task Label */}
                <span
                  className="flex-1 text-[12.5px] leading-snug transition-all"
                  style={{
                    color: isDone ? "var(--qc-ink-3)" : "var(--qc-ink)",
                    textDecoration: isDone ? "line-through" : "none",
                  }}
                >
                  {task.label}
                </span>

                {/* Status Meta Badge */}
                {task.meta && (
                  <span
                    className="text-[9.5px] font-mono tracking-wider uppercase px-2 py-0.5 rounded shrink-0 font-medium"
                    style={BADGE_STYLE[task.status]}
                  >
                    {task.meta}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom footer status */}
        <div
          className="px-4 py-2 border-t border-[var(--qc-hair-2)] flex items-center justify-between text-[10.5px] font-mono shrink-0"
          style={{ background: "var(--qc-surface)", color: "var(--qc-ink-3)" }}
        >
          <span>
            {tasks.filter((t) => t.status === "done").length} OF {tasks.length} COMPLETED
          </span>
          <span className="text-[var(--qc-ink-2)]">Auto-syncs with CRM</span>
        </div>
      </div>
    </div>
  );
}
