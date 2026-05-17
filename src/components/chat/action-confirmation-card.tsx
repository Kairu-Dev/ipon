"use client";
import { useState } from "react";
import { CHAT_STRINGS as t } from "@/locale/chat";
import { PAYMENT_METHODS } from "@/constants/transactions";


interface PendingAction {
  actionType: string;
  params: Record<string, unknown>;
}

interface ActionConfirmationCardProps {
  action: PendingAction;
  onConfirm: (overrides?: Record<string, unknown>) => void;
  onCancel: () => void;
  isExecuting: boolean;
}

const SELECTABLE_ICONS = ["flight", "laptop_mac", "home", "favorite", "star", "redeem"];

/** Safely format a number with toLocaleString, returning fallback on bad input. */
function safeAmount(val: unknown): string {
  const num = Number(val);
  return isNaN(num) ? "—" : `₱${num.toLocaleString()}`;
}

const ACTION_LABELS: Record<string, {
  title: string | ((params: Record<string, unknown>) => string);
  icon: string;
  getDetails: (params: Record<string, unknown>) => string[];
}> = {
  addTransaction: {
    title: "Log this transaction?",
    icon: "receipt_long",
    getDetails: (p) => [
      (p.title as string) || "Untitled",
      `${safeAmount(p.amount)} · ${p.category || "—"}`,
      `Date: ${p.date || "Today"}`,
    ],
  },
  createGoal: {
    title: "Create savings goal?",
    icon: "flag",
    getDetails: (p) => [
      (p.name as string) || "Unnamed goal",
      `Target: ${safeAmount(p.targetAmount)}`,
      `Deadline: ${p.deadline || "None"}`,
    ],
  },
  contributeToGoal: {
    title: "Contribute to goal?",
    icon: "savings",
    getDetails: (p) => [
      (p.goalName as string) || "Unnamed goal",
      `${safeAmount(p.amount)} contribution`,
    ],
  },
  setBudgetLimit: {
    title: (params) => params.isNew === true
      ? "Create new budget category?"
      : "Update budget limit?",
    icon: "tune",
    getDetails: (p) => [
      (p.category as string) || "—",
      `Monthly limit: ${safeAmount(p.limit)}`,
      ...(p.description ? [`Description: ${p.description}`] : []),
    ],
  },
};

export function ActionConfirmationCard({
  action,
  onConfirm,
  onCancel,
  isExecuting,
}: ActionConfirmationCardProps) {
  const [selectedIcon, setSelectedIcon] = useState<string>((action.params.icon as string) || "flight");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>((action.params.paymentMethod as string) || "Cash");

  const config = ACTION_LABELS[action.actionType] || {
    title: "Confirm action?",
    icon: "check_circle",
    getDetails: () => ["Unknown action"],
  };

  const title = typeof config.title === "function" ? config.title(action.params) : config.title;
  const details = config.getDetails(action.params);

  return (
    <div className="flex gap-3 max-w-[85%] self-start">
      <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0 mt-1">
        <span className="material-symbols-outlined text-on-primary-container text-sm" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">auto_awesome</span>
      </div>
      <div className="chat-bubble-ai">
        <p className="mb-2 text-on-surface">{title}</p>

        {/* Action details */}
        <ul className="list-disc list-inside space-y-1 text-sm mb-4">
          {details.map((detail, idx) => (
            <li key={idx}>
              {idx === 0 ? <strong>{detail}</strong> : detail}
            </li>
          ))}
        </ul>

        {/* Payment Method Selector (only for addTransaction) */}
        {action.actionType === "addTransaction" && (
          <div className="mb-4 bg-surface-container-low p-3 rounded-xl border border-surface-variant">
            <p className="text-xs font-label-md text-on-surface-variant mb-2">Payment Method</p>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method}
                  onClick={() => setSelectedPaymentMethod(method)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-label-md transition-colors ${
                    selectedPaymentMethod === method
                      ? "bg-primary text-on-primary"
                      : "bg-surface text-on-surface-variant hover:bg-surface-variant"
                  }`}
                  aria-label={`Select ${method}`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Icon Selector (only for Create Goal or Custom Budget) */}
        {(action.actionType === "createGoal" || (action.actionType === "setBudgetLimit" && action.params.isNew === true)) && (
          <div className="mb-4 bg-surface-container-low p-3 rounded-xl border border-surface-variant">
            <p className="text-xs font-label-md text-on-surface-variant mb-2">Choose an Icon</p>
            <div className="flex gap-2">
              {SELECTABLE_ICONS.map((ic) => (
                <button
                  key={ic}
                  onClick={() => setSelectedIcon(ic)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    selectedIcon === ic 
                      ? "bg-primary text-on-primary" 
                      : "bg-surface text-on-surface-variant hover:bg-surface-variant"
                  }`}
                  aria-label={`Select ${ic} icon`}
                >
                  <span className="material-symbols-outlined text-[20px] leading-none" aria-hidden="true">{ic}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action block styled like the "Safe to Spend" block */}
        <div className="mt-3 p-3 bg-surface-container-highest rounded-lg border border-surface-variant flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined" aria-hidden="true">
              {config.icon}
            </span>
          </div>
          <div className="flex-1">
            <p className="font-label-md text-label-md text-on-surface">Confirm Action</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Tap Yes to proceed</p>
          </div>
        </div>

        {/* Confirm/Cancel buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => {
              if (action.actionType === "createGoal" || (action.actionType === "setBudgetLimit" && action.params.isNew === true)) {
                onConfirm({ icon: selectedIcon });
              } else if (action.actionType === "addTransaction") {
                onConfirm({ paymentMethod: selectedPaymentMethod });
              } else {
                onConfirm();
              }
            }}
            disabled={isExecuting}
            className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md text-sm hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">check</span>
            {isExecuting ? "Processing..." : t.CONFIRM_YES}
          </button>
          <button
            onClick={onCancel}
            disabled={isExecuting}
            className="flex items-center gap-2 bg-surface-container text-on-surface-variant px-4 py-2 rounded-lg font-label-md text-sm hover:bg-surface-container-high transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">close</span>
            {t.CONFIRM_CANCEL}
          </button>
        </div>
      </div>
    </div>
  );
}
