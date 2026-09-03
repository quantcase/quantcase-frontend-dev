"use client";

import { useState } from "react";
import { MonoLabel } from "@/components/ds";

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

const TITLE_ICON = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ color: "var(--qc-ink-2)" }}>
    <rect x="3" y="5" width="3.5" height="3.5" rx="0.5"/><rect x="3" y="15" width="3.5" height="3.5" rx="0.5"/>
    <path d="M9 6.5h11 M9 16.5h11"/>
  </svg>
);

const ADD_ACTION = (
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
);

export function TodaysTasks({ tasks: initialTasks, style, className = "" }: TodaysTasksProps) {
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
    <aside
      className={className}
      style={{
        background: "var(--qc-card)",
        border: "1px solid var(--qc-hair)",
        borderRadius: 10,
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        position: "relative",
        overflow: "hidden",
        marginTop: 0,
        ...style,
      }}
    >
      {/* Lime gradient overlay (bottom 60%) */}
      <div
        style={{
          position: "absolute",
          inset: "auto 0 0 0",
          height: "60%",
          background: "linear-gradient(180deg, transparent 0%, var(--qc-lime) 100%)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <MonoLabel style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {TITLE_ICON}
            Today&apos;s tasks
          </MonoLabel>
          {ADD_ACTION}
        </div>

        {/* Task list */}
        <ul style={{ listStyle: "none", margin: 0, padding: 0, paddingTop: 8, gap: 0 }}>
          {tasks.map((task, i) => {
            const isDone = task.status === "done";
            return (
              <li
                key={task.id}
                onClick={() => toggleTask(task.id)}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "start",
                  paddingTop: i === 0 ? 0 : 8,
                  paddingBottom: 8,
                  borderTop: i === 0 ? "none" : "1px dashed var(--qc-hair-2)",
                  fontSize: 13,
                  cursor: "pointer",
                  marginLeft: 0,
                }}
              >
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
                    marginTop: 1,
                  }}
                >
                  {isDone && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12l5 5L20 7"/>
                    </svg>
                  )}
                </div>

                <span style={{ flex: 1, color: isDone ? "var(--qc-ink-3)" : "var(--qc-ink)", textDecoration: isDone ? "line-through" : "none" }}>
                  {task.label}
                </span>

                {task.meta && (
                  <MonoLabel
                    size={9.5}
                    tracking="0.12em"
                    color={task.status === "overdue" ? "var(--qc-down)" : isDone ? "var(--qc-up)" : "var(--qc-ink-3)"}
                    style={{ padding: "3px 7px", borderRadius: 4, alignSelf: "start", marginTop: 1, ...BADGE_STYLE[task.status] }}
                  >
                    {task.meta}
                  </MonoLabel>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
