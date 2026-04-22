"use client";

import { useState, useRef, useEffect } from "react";
import { ListTodo, Plus, X } from "lucide-react";
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

function getStatusMeta(dueDate: string): { status: TaskStatus; meta: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diff = due.getTime() - today.getTime();
  if (diff < 0) return { status: "overdue", meta: "Overdue" };
  if (diff === 0) return { status: "pending", meta: "Today" };
  return { status: "pending", meta: due.toLocaleDateString("en-US", { month: "short", day: "numeric" }) };
}

export function TodaysTasks({ tasks: initialTasks, className }: TodaysTasksProps) {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [showForm, setShowForm] = useState(false);
  const [taskLabel, setTaskLabel] = useState("");
  const [taskDate, setTaskDate] = useState(new Date().toISOString().split("T")[0]);
  const formRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!showForm) return;
    function handleClick(e: MouseEvent) {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setShowForm(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showForm]);

  useEffect(() => {
    if (showForm) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [showForm]);

  function toggleTask(id: string) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (t.status === "done") {
          const isOverdue = t.meta === "Overdue";
          return { ...t, status: isOverdue ? "overdue" : "pending" };
        }
        return { ...t, status: "done", meta: "Done" };
      })
    );
  }

  function addTask(e: React.FormEvent) {
    e.preventDefault();
    const label = taskLabel.trim();
    if (!label) return;
    const { status, meta } = getStatusMeta(taskDate);
    const newTask: TaskItem = {
      id: Date.now().toString(),
      label,
      status,
      meta,
    };
    setTasks((prev) => [newTask, ...prev]);
    setTaskLabel("");
    setTaskDate(new Date().toISOString().split("T")[0]);
    setShowForm(false);
  }

  return (
    <div
      className={cn("rounded-[10px] p-2 flex flex-col relative", className)}
      style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-panel)" }}
    >
      {/* Panel header */}
      <div className="px-2 pt-1 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListTodo className="size-3.5" style={{ color: "var(--qc-text-muted)" }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--qc-text-heading)", textTransform: "uppercase", letterSpacing: "0.01em", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>
            Today&apos;s Tasks
          </span>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center justify-center size-6 rounded-md transition-colors"
          style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-card)" }}
          aria-label="Add task"
        >
          <Plus className="size-3.5" style={{ color: "var(--qc-text-heading)" }} />
        </button>
      </div>

      {/* Add task popup */}
      {showForm && (
        <div
          ref={formRef}
          className="absolute right-2 top-10 z-50 w-64 rounded-[10px] shadow-lg p-3 flex flex-col gap-2"
          style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-card)" }}
        >
          <div className="flex items-center justify-between mb-0.5">
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--qc-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>
              New Task
            </span>
            <button
              onClick={() => setShowForm(false)}
              className="transition-colors"
              style={{ color: "var(--qc-text-muted)" }}
              aria-label="Close"
            >
              <X className="size-3.5" />
            </button>
          </div>
          <form onSubmit={addTask} className="flex flex-col gap-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Task description"
              value={taskLabel}
              onChange={(e) => setTaskLabel(e.target.value)}
              className="w-full rounded-md px-3 py-1.5 text-[13px] outline-none transition-colors"
              style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-panel)", color: "var(--qc-text-heading)" }}
            />
            <input
              type="date"
              value={taskDate}
              onChange={(e) => setTaskDate(e.target.value)}
              className="w-full rounded-md px-3 py-1.5 text-[13px] outline-none transition-colors"
              style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-panel)", color: "var(--qc-text-heading)" }}
            />
            <button
              type="submit"
              className="w-full rounded-md text-[12px] font-semibold py-1.5 transition-colors"
              style={{ background: "var(--qc-accent-primary)", color: "var(--qc-accent-primary-fg)" }}
            >
              Add Task
            </button>
          </form>
        </div>
      )}

      {/* Inner white box */}
      <div
        className="rounded-[10px] flex flex-col divide-y overflow-hidden"
        style={{ background: "var(--qc-surface-card)", border: "1px solid var(--qc-border-inner)" }}
      >
        {tasks.length === 0 && (
          <p className="px-4 py-4 text-[13px] text-center" style={{ color: "var(--qc-text-muted)" }}>No tasks for today.</p>
        )}
        {tasks.map((task) => {
          const isDone = task.status === "done";
          const isOverdue = task.status === "overdue";
          return (
            <div
              key={task.id}
              className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors"
              style={{ borderTopColor: "var(--qc-border-inner)" }}
              onClick={() => toggleTask(task.id)}
            >
              {/* Checkbox */}
              <div
                className={cn(
                  "flex-shrink-0 size-4 rounded flex items-center justify-center transition-colors",
                )}
                style={{
                  border: isDone ? "1px solid var(--qc-up)" : "1px solid var(--qc-border-default)",
                  background: isDone ? "var(--qc-up)" : "var(--qc-surface-card)",
                }}
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
                style={{ color: isDone ? "var(--qc-text-muted)" : "var(--qc-text-heading)" }}
              >
                {task.label}
              </p>

              {/* Meta / status badge */}
              {task.meta && (
                <span
                  className="flex-shrink-0 text-[10px] font-semibold uppercase tracking-wider rounded-sm px-1.5 py-0.5"
                  style={{
                    background: isOverdue ? "var(--qc-down-soft)" : isDone ? "var(--qc-up-soft)" : "var(--qc-chip-bg)",
                    color: isOverdue ? "var(--qc-down)" : isDone ? "var(--qc-up)" : "var(--qc-text-muted)",
                    border: isOverdue ? "1px solid var(--qc-down)" : isDone ? "1px solid var(--qc-up)" : "1px solid var(--qc-chip-border)",
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
