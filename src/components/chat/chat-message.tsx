"use client";
// src/components/chat/chat-message.tsx
// Renders a single chat bubble — user messages right-aligned, AI messages left-aligned.
import { GoalProgressCard } from "./goal-progress-card";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

const pad = (n: number) => String(n).padStart(2, "0");

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const currentMonth = `${new Date().getFullYear()}-${pad(new Date().getMonth() + 1)}`;
  const totals = useQuery(api.transactions.getTotals, { month: currentMonth });

  // Only attempt goalProgress parsing for assistant messages
  const goalProgressMatch = content.match(/\|\|\|GOAL_PROGRESS\|\|\|([\s\S]*?)\|\|\|END\|\|\|/);
  let goalProgressData: { goalId: string | null } | null = null;
  let displayContent = content;

  if (goalProgressMatch) {
    try {
      const parsed = JSON.parse(goalProgressMatch[1]);
      if (parsed && (parsed.goalId === null || typeof parsed.goalId === "string")) {
        goalProgressData = parsed;
        displayContent = displayContent.replace(goalProgressMatch[0], "");
      }
    } catch (e) { console.warn("GoalProgress parse fail", e); }
  }

  const isUser = role === "user";

  if (isUser) {
    return (
      <div className="flex gap-3 max-w-[85%] self-end flex-row-reverse">
        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="User profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAc9dUthN5WZD0wLD4YPCDkT7oMKVujg2l2zgAleBIiP0QzCTd1QpLcwTV0CN4hhsmHRgw_-Knpwrvr5Z62XLiwtYqoLYYX4azDTB-16IzAcMyfVE87JkaavK0olRco-OW6eRtu-z1UB7qLmnvnf2ocaNjTu-39VEEgM8OmsxnYOfA4AxfEgA3fgAXLbFBZcm5voXJLNsmFeV08gtVNaCPpvH3OuDiuihD_0JxhYd0UCXHEBIsWUNqvRXLf_HWlZtvV214AdSh--_pc"/>
        </div>
        <div className="chat-bubble-user">
          <p className="whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    );
  }

  // Handle verdict extraction and stripping
  let verdictData: { verdict: "safe" | "caution" | "risk"; verdict_reason: string } | null = null;
  let budgetBreakdown: Array<{ category: string; limit: number; spent: number; percentage: number }> | null = null;

  // 1. Extract Verdict — with shape validation
  const verdictMatch = content.match(/\|\|\|VERDICT\|\|\|([\s\S]*?)\|\|\|END\|\|\|/);
  if (verdictMatch) {
    try {
      const parsed = JSON.parse(verdictMatch[1]);
      if (parsed && typeof parsed.verdict === "string" && typeof parsed.verdict_reason === "string"
        && ["safe", "caution", "risk"].includes(parsed.verdict)) {
        verdictData = parsed;
        displayContent = displayContent.replace(verdictMatch[0], "");
      }
    } catch (e) { console.warn("Verdict parse fail", e); }
  }

  // 2. Extract Budget Breakdown — with shape validation
  const budgetMatch = content.match(/\|\|\|BUDGET_BREAKDOWN\|\|\|([\s\S]*?)\|\|\|END\|\|\|/);
  if (budgetMatch) {
    try {
      const parsed = JSON.parse(budgetMatch[1]);
      if (Array.isArray(parsed) && parsed.every((item: Record<string, unknown>) =>
        typeof item.category === "string" && typeof item.limit === "number"
        && typeof item.spent === "number" && typeof item.percentage === "number"
      )) {
        budgetBreakdown = parsed;
        displayContent = displayContent.replace(budgetMatch[0], "");
      }
    } catch (e) { console.warn("Budget parse fail", e); }
  }

  // 3. Extract Affordability Check & compute verdict locally
  const affordabilityMatch = content.match(/\|\|\|AFFORDABILITY_CHECK\|\|\|([\s\S]*?)\|\|\|END\|\|\|/);
  if (affordabilityMatch) {
    try {
      const parsed = JSON.parse(affordabilityMatch[1]);
      if (parsed && typeof parsed.cost === "number") {
        displayContent = displayContent.replace(affordabilityMatch[0], "");
        
        if (totals !== undefined) {
          if (totals.remainingBalance < parsed.cost) {
            verdictData = { 
              verdict: "risk", 
              verdict_reason: `Insufficient balance (Cost: ₱${parsed.cost.toLocaleString()})` 
            };
          } else {
            verdictData = { verdict: "safe", verdict_reason: "You have enough balance." };
            if (budgetBreakdown && budgetBreakdown.length > 0 && budgetBreakdown[0].percentage > 100) {
              verdictData = { 
                verdict: "caution", 
                verdict_reason: "This will put you over your category budget." 
              };
            }
          }
        }
      }
    } catch (e) { console.warn("Affordability parse fail", e); }
  }

  displayContent = displayContent.trim();

  // Strip italics and standardise list items, but preserve bold for splitting
  const preProcessedContent = displayContent
    .replace(/\*(.*?)\*/g, "$1")       // *italic* → plain
    .replace(/^[\*\-] /gm, "• ");      // * list → • list

  const cleanContentParts = preProcessedContent.split(/(\*\*.*?\*\*)/g);

  const verdictIcons = {
    safe: "check_circle",
    caution: "warning",
    risk: "error",
  };

  return (
    <div className="flex gap-3 max-w-[85%] self-start">
      <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0 mt-1">
        <span className="material-symbols-outlined text-on-primary-container text-sm" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">auto_awesome</span>
      </div>
      <div className="chat-bubble-ai-text flex flex-col gap-4">
        {cleanContentParts.length > 0 && (
          <p className="whitespace-pre-wrap">
            {cleanContentParts.map((part, i) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
              }
              return part;
            })}
          </p>
        )}
        
        {/* Visual Budget Breakdown */}
        {budgetBreakdown && budgetBreakdown.length > 0 && (
          <div className="flex flex-col gap-4 py-2">
            {budgetBreakdown.map((item, idx) => (
              <div key={idx} className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-sm font-medium text-on-surface">
                  <span>{item.category}</span>
                  <span>₱{item.spent.toLocaleString()}</span>
                </div>
                {/* Progress Bar Container */}
                <div className="w-full h-3 bg-surface-container rounded-full">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 shadow-sm ${item.percentage >= 100 ? "bg-error" : "bg-primary"}`}
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                  />
                </div>
                {/* Percentage Context */}
                <div className="text-right text-[10px] text-on-surface-variant uppercase tracking-tight">
                  {item.percentage}% of {item.category.toLowerCase()} budget
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Verdict Badge */}
        {verdictData && (
          <div className="mt-1 p-3 bg-surface-container-highest rounded-lg border border-surface-variant flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              verdictData.verdict === "safe" ? "bg-green-100 text-green-700" :
              verdictData.verdict === "caution" ? "bg-amber-100 text-amber-700" :
              "bg-red-100 text-red-700"
            }`}>
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                {verdictIcons[verdictData.verdict]}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-label-md text-label-md text-on-surface">
                {verdictData.verdict === "safe" ? "Safe to Spend" : 
                 verdictData.verdict === "caution" ? "Caution" : "High Risk"}
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {verdictData.verdict_reason.includes("Impact on savings") ? verdictData.verdict_reason : `Impact on savings: ${verdictData.verdict_reason}`}
              </p>
            </div>
          </div>
        )}
        {/* Visual Goal Progress Card */}
        {goalProgressData && (
          <div className="mt-1">
            <GoalProgressCard goalId={goalProgressData.goalId} />
          </div>
        )}
      </div>
    </div>
  );
}
