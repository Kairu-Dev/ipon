"use client";

import { UserProfile } from "@clerk/nextjs";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";

interface UserPreferences {
  currency?: string;
  defaultPaymentMethod?: string;
  paydayCycle?: string;
}

function FinancialPreferencesForm({
  initialPreferences,
}: {
  initialPreferences?: UserPreferences;
}) {
  const updatePreferences = useMutation(api.users.updatePreferences);
  const [currency, setCurrency] = useState(initialPreferences?.currency ?? "PHP");
  const [defaultPayment, setDefaultPayment] = useState(initialPreferences?.defaultPaymentMethod ?? "GCash");
  const [paydayCycle, setPaydayCycle] = useState(initialPreferences?.paydayCycle ?? "1st & 15th");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updatePreferences({
        currency,
        defaultPaymentMethod: defaultPayment,
        paydayCycle,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save preferences:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSavePreferences} className="space-y-6">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 space-y-6">
        <div>
          <h2 className="font-h2 text-lg font-bold text-on-surface mb-1">Financial Defaults</h2>
          <p className="text-secondary text-sm">
            Tailor how Ipon calculates and displays your monthly transactions and budgets.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 border border-primary/30 rounded-lg text-primary text-sm">
            <span className="material-symbols-outlined text-lg">check_circle</span>
            Preferences saved successfully.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Primary Currency */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-on-surface">Primary Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-lg text-on-surface outline-none focus:border-primary"
            >
              <option value="PHP">Philippine Peso (PHP ₱)</option>
              <option value="USD">US Dollar (USD $)</option>
              <option value="EUR">Euro (EUR €)</option>
            </select>
            <p className="text-xs text-secondary">Default currency used across goals and transactions.</p>
          </div>

          {/* Default Payment Method */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-on-surface">Default Payment Method</label>
            <select
              value={defaultPayment}
              onChange={(e) => setDefaultPayment(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-lg text-on-surface outline-none focus:border-primary"
            >
              <option value="GCash">GCash</option>
              <option value="Maya">Maya</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
              <option value="Credit Card">Credit Card</option>
            </select>
            <p className="text-xs text-secondary">Pre-selected payment method when logging new expenses.</p>
          </div>

          {/* Payday Cycle */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-on-surface">Payday Cycle</label>
            <select
              value={paydayCycle}
              onChange={(e) => setPaydayCycle(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-lg text-on-surface outline-none focus:border-primary"
            >
              <option value="1st & 15th">Bimonthly (15th & 30th / 1st & 15th)</option>
              <option value="Monthly">Monthly (End of month)</option>
              <option value="Weekly">Weekly</option>
            </select>
            <p className="text-xs text-secondary">Used for cash-flow projection and reminders.</p>
          </div>
        </div>

        <div className="pt-4 border-t border-outline-variant/20 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-primary text-on-primary font-semibold text-sm rounded-lg hover:bg-primary-container transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </div>
    </form>
  );
}

export default function SettingsPage() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const updatePreferences = useMutation(api.users.updatePreferences);
  const [activeTab, setActiveTab] = useState<"account" | "preferences" | "ai">("account");

  const aiSuggestions = currentUser?.aiSuggestions ?? true;

  return (
    <div className="space-y-8 max-w-4xl pb-16">
      {/* Page Header */}
      <section className="space-y-1">
        <h1 className="font-h1 text-h1 text-on-surface">Settings</h1>
        <p className="font-body-base text-body-base text-secondary">
          Manage your account credentials, security, and app preferences.
        </p>
      </section>

      {/* Tabs */}
      <div className="flex border-b border-outline-variant/30 gap-6">
        <button
          onClick={() => setActiveTab("account")}
          className={`pb-3 font-label-md text-label-md transition-colors border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === "account"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-secondary hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined text-lg">person</span>
          Account & Security
        </button>
        <button
          onClick={() => setActiveTab("preferences")}
          className={`pb-3 font-label-md text-label-md transition-colors border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === "preferences"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-secondary hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined text-lg">tune</span>
          Financial Preferences
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          className={`pb-3 font-label-md text-label-md transition-colors border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === "ai"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-secondary hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined text-lg">smart_toy</span>
          AI Advisor
        </button>
      </div>

      {/* Tab: Account & Security */}
      {activeTab === "account" && (
        <div className="space-y-6">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6">
            <h2 className="font-h2 text-lg font-bold text-on-surface mb-2">Clerk Account Profile</h2>
            <p className="text-secondary text-sm mb-6">
              Update your personal information, linked social accounts (Google, Apple), and multi-factor authentication.
            </p>
            <div className="flex justify-center w-full">
              <UserProfile
                routing="hash"
                appearance={{
                  elements: {
                    card: "shadow-none border border-outline-variant/30 bg-transparent w-full",
                    rootBox: "w-full",
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab: Financial Preferences (Derived state via key, zero useEffect) */}
      {activeTab === "preferences" && (
        <FinancialPreferencesForm
          key={currentUser?._id ?? "loading"}
          initialPreferences={currentUser ?? undefined}
        />
      )}

      {/* Tab: AI Advisor (Direct reactive state, zero useEffect) */}
      {activeTab === "ai" && (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="font-h2 text-lg font-bold text-on-surface mb-1">Gemini AI Spending Advisor</h2>
            <p className="text-secondary text-sm">
              Configure how automated spending insights and budgeting recommendations are delivered.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-container-low/50 rounded-xl border border-outline-variant/20">
              <div className="space-y-1">
                <p className="font-semibold text-sm text-on-surface">Autonomous Financial Insights</p>
                <p className="text-xs text-secondary">
                  Analyze transaction history and highlight discretionary spending trends automatically.
                </p>
              </div>
              <input
                type="checkbox"
                checked={aiSuggestions}
                onChange={async (e) => {
                  const val = e.target.checked;
                  try {
                    await updatePreferences({ aiSuggestions: val });
                  } catch (err) {
                    console.error("Failed to update AI preference:", err);
                  }
                }}
                className="w-5 h-5 accent-primary cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
