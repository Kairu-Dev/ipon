// src/components/auth/password-checklist.tsx
// Inline password requirement checklist for the sign-up form.
// Shows ✓/✗ indicators that update in real-time as the user types.
"use client";
import { memo } from "react";
import { AUTH_STRINGS } from "@/constants/auth";

interface PasswordChecklistProps {
  /** Current password value from the input field */
  password?: string;
}

// React.memo prevents re-renders when the parent re-renders for unrelated
// state changes (e.g., name or confirm-password typing). The checklist only
// re-renders when the `password` prop actually changes.
export const PasswordChecklist = memo(function PasswordChecklist({
  password = "",
}: PasswordChecklistProps) {
  // Don't render anything until the user starts typing
  if (password.length === 0) return null;

  const rules = [
    { label: AUTH_STRINGS.RULE_MIN_LENGTH, isValid: password.length >= 8 },
    { label: AUTH_STRINGS.RULE_UPPERCASE, isValid: /[A-Z]/.test(password) },
    { label: AUTH_STRINGS.RULE_LOWERCASE, isValid: /[a-z]/.test(password) },
    { label: AUTH_STRINGS.RULE_NUMBER, isValid: /[0-9]/.test(password) },
    { label: AUTH_STRINGS.RULE_SPECIAL, isValid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password) },
    { label: AUTH_STRINGS.RULE_NOT_BLANK, isValid: password.trim().length > 0 },
  ];

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1.5">
      {rules.map((rule) => {
        const passed = rule.isValid;
        return (
          <div
            key={rule.label}
            className={`flex items-center gap-1.5 font-body-sm text-xs transition-colors ${
              passed ? "text-primary" : "text-error"
            }`}
          >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">
              {passed ? "check" : "close"}
            </span>
            {rule.label}
          </div>
        );
      })}
    </div>
  );
});
