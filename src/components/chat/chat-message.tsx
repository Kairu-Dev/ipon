"use client";
// src/components/chat/chat-message.tsx
// Renders a single chat bubble — user messages right-aligned, AI messages left-aligned.
import { GoalProgressCard } from "./goal-progress-card";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  // Only attempt goalProgress parsing for assistant messages
  const goalProgressData = (() => {
    if (role !== "assistant") return null;
    try {
      const parsed = JSON.parse(content);
      if (parsed && parsed.type === "goalProgress") return parsed;
    } catch { /* not JSON — expected for most messages */ }
    return null;
  })();

  if (goalProgressData) {
    return (
      <div className="flex gap-3 max-w-[85%] self-start w-full">
        <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0 mt-1">
          <span className="material-symbols-outlined text-on-primary-container text-sm" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">colors_spark</span>
        </div>
        <GoalProgressCard goalId={goalProgressData.goalId} />
      </div>
    );
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
  let displayContent = content;
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

  displayContent = displayContent.trim();

  // Strip markdown bold/italic before display
  const cleanContent = displayContent
    .replace(/\*\*(.*?)\*\*/g, "$1")  // **bold** → plain
    .replace(/\*(.*?)\*/g, "$1")       // *italic* → plain
    .replace(/^[\*\-] /gm, "• ");      // * list → • list

  const verdictColors = {
    safe: "bg-green-100 text-green-800 border-green-200",
    caution: "bg-amber-100 text-amber-800 border-amber-200",
    risk: "bg-red-100 text-red-800 border-red-200",
  };

  const verdictIcons = {
    safe: "check_circle",
    caution: "warning",
    risk: "error",
  };

  return (
    <div className="flex gap-3 max-w-[85%] self-start">
      <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0 mt-1">
        <span className="material-symbols-outlined text-on-primary-container text-sm" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">colors_spark</span>
      </div>
      <div className="chat-bubble-ai-text flex flex-col gap-4">
        {cleanContent && <p className="whitespace-pre-wrap">{cleanContent}</p>}
        
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
                <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${item.percentage >= 100 ? "bg-error" : "bg-primary"}`}
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
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium ${verdictColors[verdictData.verdict]}`}>
            <span className="material-symbols-outlined text-base" aria-hidden="true">
              {verdictIcons[verdictData.verdict]}
            </span>
            <div className="flex flex-col">
              <span className="uppercase tracking-wider font-bold">{verdictData.verdict} VERDICT</span>
              <span className="opacity-90">{verdictData.verdict_reason}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
