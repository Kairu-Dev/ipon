"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import Link from "next/link";

interface NotificationItem {
  id: string;
  type: "budget" | "goal" | "info";
  title: string;
  message: string;
  link: string;
  timestamp: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${pad(today.getMonth() + 1)}`;

  const budgets = useQuery(api.budgets.getBudgets, { month: currentMonth });
  const spentMap = useQuery(api.budgets.getSpentPerCategory, { month: currentMonth });
  const goals = useQuery(api.goals.getGoals);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  // Compute contextual alerts
  const notifications = useMemo(() => {
    const items: NotificationItem[] = [];

    // Check budget thresholds (> 80% or > 100%)
    if (budgets && spentMap) {
      budgets.forEach((b) => {
        if (b.monthlyLimit > 0) {
          const spent = spentMap[b.category] || 0;
          const pct = Math.round((spent / b.monthlyLimit) * 100);
          if (pct >= 100) {
            items.push({
              id: `budget-over-${b.category}`,
              type: "budget",
              title: "Budget Exceeded",
              message: `You've used ${pct}% of your ${b.category} limit for this month.`,
              link: "/dashboard/budget",
              timestamp: "Active alert",
            });
          } else if (pct >= 80) {
            items.push({
              id: `budget-warn-${b.category}`,
              type: "budget",
              title: "Budget Warning",
              message: `${b.category} is currently at ${pct}% of monthly limit.`,
              link: "/dashboard/budget",
              timestamp: "Attention needed",
            });
          }
        }
      });
    }

    // Check goal achievements and milestones
    if (goals) {
      goals.forEach((g) => {
        if (g.targetAmount > 0) {
          const pct = Math.round((g.savedAmount / g.targetAmount) * 100);
          if (pct >= 100) {
            items.push({
              id: `goal-complete-${g._id}`,
              type: "goal",
              title: "Goal Completed!",
              message: `Congratulations! You reached 100% of your ${g.name} goal.`,
              link: "/dashboard/savings-goals",
              timestamp: "Target achieved",
            });
          } else if (pct >= 80) {
            items.push({
              id: `goal-near-${g._id}`,
              type: "goal",
              title: "Goal Milestone",
              message: `${g.name} is ${pct}% reached. You're almost there!`,
              link: "/dashboard/savings-goals",
              timestamp: "Milestone",
            });
          }
        }
      });
    }

    return items;
  }, [budgets, spentMap, goals]);

  const activeNotifications = notifications.filter((n) => !dismissedIds.includes(n.id));
  const hasUnread = activeNotifications.length > 0;

  const handleDismissAll = () => {
    setDismissedIds(notifications.map((n) => n.id));
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
        aria-expanded={isOpen}
        className="text-slate-500 hover:text-green-600 dark:hover:text-green-400 transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 relative cursor-pointer focus:outline-none"
      >
        <span className="material-symbols-outlined text-xl" aria-hidden="true">notifications</span>
        {hasUnread && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-white dark:ring-slate-900" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-3 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Notifications</h3>
              {hasUnread && (
                <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary font-bold rounded-full">
                  {activeNotifications.length}
                </span>
              )}
            </div>
            {hasUnread && (
              <button
                type="button"
                onClick={handleDismissAll}
                className="text-xs text-primary hover:underline font-medium cursor-pointer"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
            {activeNotifications.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-600 mb-1" aria-hidden="true">
                  notifications_paused
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">All caught up! No active financial alerts.</p>
              </div>
            ) : (
              activeNotifications.map((item) => (
                <Link
                  key={item.id}
                  href={item.link}
                  onClick={() => setIsOpen(false)}
                  className="block p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`material-symbols-outlined text-base mt-0.5 shrink-0 ${
                        item.type === "budget" ? "text-amber-500" : "text-primary"
                      }`}
                      aria-hidden="true"
                    >
                      {item.type === "budget" ? "warning" : "savings"}
                    </span>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                        <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">{item.message}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
