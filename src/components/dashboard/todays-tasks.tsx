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

  // Close popup on outside click
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

  // Focus input when popup opens
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
          // Restore to original pending/overdue state based on meta
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
    <div className={cn("rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2 flex flex-col relative", className)}>
      {/* Panel header */}
      <div className="px-2 pt-1 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListTodo className="size-3.5 text-[#888888]" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172B", textTransform: "uppercase", letterSpacing: "0.01em" }}>
            Today&apos;s Tasks
          </span>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center justify-center size-6 rounded-md border border-[#E2E2E2] bg-white hover:bg-[#F5F5F5] transition-colors"
          aria-label="Add task"
        >
          <Plus className="size-3.5 text-[#0F172B]" />
        </button>
      </div>

      {/* Add task popup */}
      {showForm && (
        <div
          ref={formRef}
          className="absolute right-2 top-10 z-50 w-64 rounded-[10px] border border-[#E2E2E2] bg-white shadow-lg p-3 flex flex-col gap-2"
        >
          <div className="flex items-center justify-between mb-0.5">
            <span style={{ fontSize: 11, fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              New Task
            </span>
            <button
              onClick={() => setShowForm(false)}
              className="text-[#888888] hover:text-[#0F172B] transition-colors"
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
              className="w-full rounded-md border border-[#E2E2E2] bg-[#F5F5F5] px-3 py-1.5 text-[13px] text-[#0F172B] placeholder:text-[#888888] outline-none focus:border-[#0F172B] transition-colors"
            />
            <input
              type="date"
              value={taskDate}
              onChange={(e) => setTaskDate(e.target.value)}
              className="w-full rounded-md border border-[#E2E2E2] bg-[#F5F5F5] px-3 py-1.5 text-[13px] text-[#0F172B] outline-none focus:border-[#0F172B] transition-colors"
            />
            <button
              type="submit"
              className="w-full rounded-md bg-[#0F172B] text-white text-[12px] font-semibold py-1.5 hover:bg-[#1e293b] transition-colors"
            >
              Add Task
            </button>
          </form>
        </div>
      )}

      {/* Inner white box */}
      <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)] flex flex-col divide-y divide-[#E2E2E2] overflow-hidden">
        {tasks.length === 0 && (
          <p className="px-4 py-4 text-[13px] text-[#888888] text-center">No tasks for today.</p>
        )}
        {tasks.map((task) => {
          const isDone = task.status === "done";
          const isOverdue = task.status === "overdue";
          return (
            <div
              key={task.id}
              className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-[#F5F5F5] transition-colors"
              onClick={() => toggleTask(task.id)}
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
