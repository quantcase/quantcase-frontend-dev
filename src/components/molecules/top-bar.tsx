"use client";

import { Bell, Search } from "lucide-react";

const quickSymbols = ["HDFC", "TCS", "INFY", "ICICI"];

export function TopBar() {
  return (
    <header className="fixed left-56 right-0 top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-800 dark:bg-gray-950">
      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 dark:border-gray-700 dark:bg-gray-900">
          <Search className="size-3.5 shrink-0 text-gray-400" />
          <input
            type="text"
            placeholder="Search Indian companies (e.g. HDFC, Reliance)..."
            className="w-72 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none dark:text-gray-200 dark:placeholder:text-gray-500"
          />
        </div>

        {/* Quick symbol chips */}
        <div className="flex items-center gap-2">
          {quickSymbols.map((sym) => (
            <span
              key={sym}
              className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 dark:border-gray-700 dark:text-gray-300"
            >
              {sym}
            </span>
          ))}
        </div>
      </div>

      {/* Right: notification + user */}
      <div className="flex items-center gap-4">
        <button
          aria-label="Notifications"
          className="relative text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <Bell className="size-5" />
          <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-red-500" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="text-right">
            <p className="text-sm font-semibold leading-tight text-gray-900 dark:text-white">
              Alex Morgan
            </p>
            <p className="text-xs leading-tight text-gray-500 dark:text-gray-400">
              Relationship Manager
            </p>
          </div>
          <div className="flex size-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
            AM
          </div>
        </div>
      </div>
    </header>
  );
}
