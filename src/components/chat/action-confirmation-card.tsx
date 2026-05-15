"use client";
// src/components/chat/action-confirmation-card.tsx
// Confirmation card shown when the AI wants to perform a write action.
// User must explicitly confirm or cancel before any mutation runs.

import { CHAT_STRINGS as t } from "@/locale/chat";


interface PendingAction {
  actionType: string;
  params: Record<string, unknown>;
}

interface ActionConfirmationCardProps {
  action: PendingAction;
  onConfirm: () => void;
  onCancel: () => void;
  isExecuting: boolean;
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
      p.title as string,
      `₱${(p.amount as number).toLocaleString()} · ${p.category} · ${p.paymentMethod}`,
      `Date: ${p.date}`,
    ],
  },
  contributeToGoal: {
    title: "Contribute to goal?",
    icon: "savings",
    getDetails: (p) => [
      p.goalName as string,
      `₱${(p.amount as number).toLocaleString()} contribution`,
    ],
  },
  setBudgetLimit: {
    title: (params) => params.isNew
      ? "Create new budget category?"
      : "Update budget limit?",
    icon: "tune",
    getDetails: (p) => [
      p.category as string,
      `Monthly limit: ₱${(p.limit as number).toLocaleString()}`,
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
        <span className="material-symbols-outlined text-on-primary-container text-sm" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">colors_spark</span>
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
            onClick={onConfirm}
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
