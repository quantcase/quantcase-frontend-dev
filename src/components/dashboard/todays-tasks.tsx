"use client";

import { useState } from "react";
import { CardShell, MonoLabel } from "@/components/ds";

export type TaskStatus = "pending" | "done" | "overdue";

export interface TaskItem {
  id: string;
  label: string;
  status: TaskStatus;
  meta?: string;
}

interface TodaysTasksProps {
  tasks: TaskItem[];
}

const BADGE_STYLE: Record<TaskStatus, React.CSSProperties> = {
  pending: { background: "transparent", color: "var(--qc-ink-3)", border: "none" },
  overdue: { background: "var(--qc-down-soft)", color: "var(--qc-down)", border: "1px solid #E8C4BE" },
  done:    { background: "var(--qc-up-soft)",   color: "var(--qc-up)",   border: "1px solid #BBD9C6" },
};

export function TodaysTasks({ tasks: initialTasks }: TodaysTasksProps) {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);

  function toggleTask(id: string) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (t.status === "done") return { ...t, status: t.meta?.startsWith("Overdue") ? "overdue" as TaskStatus : "pending" as TaskStatus };
        return { ...t, status: "done" as TaskStatus, meta: "DONE · " + new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }) };
      })
    );
  }

  return (
    <CardShell style={{ padding: "14px 16px" }}>
      {/* Head */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <MonoLabel style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ color: "var(--qc-ink-2)" }}>
            <rect x="3" y="5" width="3.5" height="3.5" rx="0.5"/><rect x="3" y="15" width="3.5" height="3.5" rx="0.5"/>
            <path d="M9 6.5h11 M9 16.5h11"/>
          </svg>
          Today&apos;s tasks
        </MonoLabel>

        <button
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            background: "var(--qc-lime)",
            color: "var(--qc-ink)",
            border: "1px solid var(--qc-lime-edge)",
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
          }}
          aria-label="Add task"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14 M5 12h14"/>
          </svg>
        </button>
      </div>

      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {tasks.map((task, i) => {
          const isDone = task.status === "done";
          return (
            <li
              key={task.id}
              onClick={() => toggleTask(task.id)}
              style={{
                display: "grid",
                gridTemplateColumns: "18px 1fr auto",
                gap: 10,
                alignItems: "center",
                padding: "10px 0",
                borderTop: i === 0 ? "none" : "1px dashed var(--qc-hair-2)",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {/* Checkbox */}
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  border: isDone ? "1px solid var(--qc-up)" : "1px solid var(--qc-hair)",
                  background: isDone ? "var(--qc-up)" : "#fff",
                  display: "grid",
                  placeItems: "center",
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {isDone && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5L20 7"/>
                  </svg>
                )}
              </div>

              <span style={{ color: isDone ? "var(--qc-ink-3)" : "var(--qc-ink)", textDecoration: isDone ? "line-through" : "none" }}>
                {task.label}
              </span>

              {task.meta && (
                <MonoLabel
                  size={9.5}
                  tracking="0.12em"
                  color={task.status === "overdue" ? "var(--qc-down)" : isDone ? "var(--qc-up)" : "var(--qc-ink-3)"}
                  style={{ padding: "3px 7px", borderRadius: 4, ...BADGE_STYLE[task.status] }}
                >
                  {task.meta}
                </MonoLabel>
              )}
            </li>
          );
        })}
      </ul>
    </CardShell>
  );
}
