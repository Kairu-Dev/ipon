"use client";

// IponAIInsights — AI-powered spending insight card for the dashboard.
// Fetches cached insight via useQuery and triggers generation on mount
// if no valid cache exists. Supports manual refresh with 3-per-day limit.

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { dashboardLocale } from "@/locale/dashboard";

// Parsed shape of the insight JSON stored in the content field
interface InsightContent {
  alert: string;
  detail: string;
  bullets: string[];
}

export function IponAIInsights() {
  const locale = dashboardLocale.aiInsights;

  // Reactive query — updates automatically when insight is saved/updated
  const insight = useQuery(api.insights.getInsight);

  // Action to trigger Gemini generation
  const generateInsight = useAction(api.insights.generateInsight);

  // Track whether we've already triggered auto-generation this mount
  const hasTriggered = useRef(false);

  // Local state for manual refresh UX
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [actionError, setActionError] = useState<false | "generic" | "rate_limit">(false);

  // Auto-generate on mount if no cached insight exists
  // Uses empty deps [] + hasTriggered ref to prevent infinite loops
  useEffect(() => {
    if (hasTriggered.current) return;
    // insight is undefined while query is loading — wait for it to resolve
    if (insight === undefined) return;

    // insight is null — no cached insight exists, trigger generation
    if (insight === null) {
      hasTriggered.current = true;
      generateInsight({ force: false })
        .then((res) => {
          if (res.status === "rate_limit") {
            setActionError("rate_limit");
          } else if (res.status === "error") {
            setActionError("generic");
          }
        })
        .catch(() => {
          setActionError("generic");
        });
    }
  }, [insight, generateInsight]);

  // Calculate remaining manual regenerations for today
  const today = new Date().toISOString().split("T")[0];
  const resetDate = insight?.manualRegenResetAt;
  const usedCount = resetDate === today ? (insight?.manualRegenCount ?? 0) : 0;
  const remainingRegens = 3 - usedCount;

  // Handle manual refresh button click
  const handleManualRegen = async () => {
    if (isRegenerating || remainingRegens <= 0) return;
    setIsRegenerating(true);
    setActionError(false);
    try {
      const res = await generateInsight({ force: true });
      if (res.status === "rate_limit") {
        setActionError("rate_limit");
      } else if (res.status === "error") {
        setActionError("generic");
      }
    } catch {
      setActionError("generic");
    } finally {
      setIsRegenerating(false);
    }
  };

  // Parse the insight content JSON string
  let parsedContent: InsightContent | null = null;
  if (insight?.content) {
    try {
      parsedContent = JSON.parse(insight.content) as InsightContent;
    } catch {
      // Malformed content — treat as error state
      parsedContent = null;
    }
  }

  // Determine what state to render
  const isLoading = insight === undefined;
  const isFallback = insight === null && !actionError;
  const isError = actionError !== false || (insight !== null && insight !== undefined && !parsedContent);
  const hasInsight = parsedContent !== null;

  return (
    <div className="bg-surface-container-low border border-primary/20 rounded-xl p-[24px] shadow-sm flex flex-col relative overflow-hidden">
      {/* Decorative background circle */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10" />

      {/* Header — icon + title */}
      <div className="flex items-center gap-2 mb-6">
        <span
          className="material-symbols-outlined text-primary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          smart_toy
        </span>
        <h2 className="font-h2 text-h2 text-on-surface">{locale.title}</h2>
      </div>

      {/* Loading state — pulsing skeleton */}
      {isLoading && (
        <div className="flex-1 flex flex-col gap-4">
          <div className="animate-pulse bg-surface-container rounded-lg h-24" />
          <div className="animate-pulse bg-surface-container rounded-lg h-16" />
          <p className="font-body-sm text-body-sm text-secondary text-center mt-2">
            {locale.loading}
          </p>
        </div>
      )}

      {/* Fallback state — not enough transactions */}
      {!isLoading && isFallback && (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-8">
          <span
            className="material-symbols-outlined text-4xl text-primary/40"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            insights
          </span>
          <p className="font-body-sm text-body-sm text-secondary max-w-[200px]">
            {locale.fallback}
          </p>
        </div>
      )}

      {/* Error state — Gemini failed or content is malformed */}
      {!isLoading && isError && (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-8">
          <span className="material-symbols-outlined text-4xl text-error/40">
            error_outline
          </span>
          <p className="font-body-sm text-body-sm text-secondary max-w-[200px]">
            {actionError === "rate_limit" ? locale.rateLimitError : locale.error}
          </p>
        </div>
      )}

      {/* Success state — display the AI insight */}
      {!isLoading && hasInsight && parsedContent && (
        <>
          {/* SMART ALERT badge + headline + detail */}
          <div className="bg-white border border-error-container rounded-lg p-4 mb-6 relative">
            <div className="absolute -top-3 left-4 bg-error text-on-error font-label-xs text-label-xs px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[10px]">warning</span>
              {locale.smartAlert}
            </div>
            <h3 className="font-h3 text-h3 text-on-surface mt-2 mb-2">
              {parsedContent.alert}
            </h3>
            <p className="font-body-sm text-body-sm text-secondary">
              {parsedContent.detail}
            </p>
          </div>

          {/* Bullet points — optional tips from Gemini */}
          {parsedContent.bullets.length > 0 && (
            <div className="space-y-4 mb-8 flex-1">
              {parsedContent.bullets.map((bullet, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-primary text-sm">
                      {i === 0 ? "lightbulb" : "trending_up"}
                    </span>
                  </div>
                  <div>
                    <p className="font-body-sm text-body-sm text-on-surface">{bullet}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Refresh button with pip indicator */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-primary/20">
            <div className="flex items-center gap-1.5">
              {/* 3 pips — filled = remaining, empty = used */}
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i < remainingRegens ? "bg-primary" : "bg-primary/20"
                  }`}
                />
              ))}
              <span className="font-label-xs text-label-xs text-primary font-medium ml-1">
                {locale.refreshesLeft.replace("{count}", String(remainingRegens))}
              </span>
            </div>

            <button
              onClick={handleManualRegen}
              disabled={isRegenerating || remainingRegens === 0}
              className="flex items-center gap-1 font-label-xs text-label-xs text-primary font-medium hover:text-primary-container transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span
                className={`material-symbols-outlined text-sm ${
                  isRegenerating ? "animate-spin" : ""
                }`}
              >
                refresh
              </span>
              {isRegenerating ? locale.refreshing : locale.refreshButton}
            </button>
          </div>
        </>
      )}

      {/* Review Budget button — always visible when not loading */}
      {!isLoading && (
        <Link
          href="/dashboard/budget"
          className="w-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mt-6"
        >
          {locale.reviewBudget}
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      )}
    </div>
  );
}
