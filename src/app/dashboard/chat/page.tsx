"use client";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  ChatMessage,
  ActionConfirmationCard,
  ChatInput,
  SuggestionChips,
  MonthlyChatContext,
} from "@/components/chat";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { CHAT_STRINGS as t } from "@/locale/chat";

/** Pad a number to 2 digits — timezone-safe date formatting. */
const pad = (n: number) => String(n).padStart(2, "0");

/** A local-only message used for optimistic UI before DB roundtrip. */
interface LocalMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

/** Pending action returned by Gemini function calling. */
interface PendingAction {
  actionType: string;
  params: Record<string, unknown>;
  userMessage: string;
  month: string;
}

/** Error bubble shown when the AI fails. */
interface ErrorState {
  message: string;
  retryMessage: string;
}

export default function ChatPage() {
  const currentMonth = useMemo(() => {
    const today = new Date();
    return `${today.getFullYear()}-${pad(today.getMonth() + 1)}`;
  }, []);

  const currentMonthName = useMemo(() => {
    return new Date().toLocaleString("en-US", { month: "long" });
  }, []);

  const chatHistory = useQuery(api.chat.getChatHistory);
  const spentMap = useQuery(api.budgets.getSpentPerCategory, { month: currentMonth });

  const sendMessage = useAction(api.chat.sendMessage);
  const executeActionMutation = useAction(api.chat.executeAction);

  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, localMessages, pendingAction, error]);

  const topSpendingCategory = useMemo(() => {
    if (!spentMap) return null;
    const entries = Object.entries(spentMap).sort(([, a], [, b]) => b - a);
    return entries.length > 0 ? entries[0][0] : null;
  }, [spentMap]);

  const allMessages = useMemo(() => {
    const dbMessages = (chatHistory ?? []).map((m) => ({
      id: m._id,
      role: m.role,
      content: m.content,
    }));
    const dbContents = new Set(dbMessages.map((m) => `${m.role}:${m.content}`));
    const uniqueLocal = localMessages.filter(
      (lm) => !dbContents.has(`${lm.role}:${lm.content}`)
    );
    return [...dbMessages, ...uniqueLocal];
  }, [chatHistory, localMessages]);

  const handleSend = useCallback(
    async (message: string) => {
      setError(null);
      const currentPendingAction = pendingAction;
      if (pendingAction) {
        setPendingAction(null);
        setLocalMessages((prev) => [
          ...prev,
          { id: `cancel-${Date.now()}`, role: "assistant", content: t.ACTION_CANCELLED },
        ]);
      }

      setLocalMessages((prev) => [
        ...prev,
        { id: `user-${Date.now()}`, role: "user", content: message },
      ]);
      setIsLoading(true);

      try {
        const result = await sendMessage({ 
          userMessage: message, 
          month: currentMonth,
          canceledActionContext: currentPendingAction ? JSON.stringify({
            actionType: currentPendingAction.actionType,
            params: currentPendingAction.params
          }) : undefined
        });
        if (result.type === "pendingAction") {
          setPendingAction({
            actionType: result.pendingAction.actionType,
            params: result.pendingAction.params as Record<string, unknown>,
            userMessage: message,
            month: currentMonth,
          });
        } else if (result.type === "text") {
          setLocalMessages((prev) => [
            ...prev,
            { id: `ai-${Date.now()}`, role: "assistant", content: result.text },
          ]);
        } else if (result.type === "error") {
          console.warn("AI response failed:", result.error);
          setError({ message: result.error, retryMessage: message });
        }
      } catch (err) {
        console.error("Chat send error:", err);
        setError({ message: t.ERROR_TITLE, retryMessage: message });
      } finally {
        setIsLoading(false);
      }
    },
    [sendMessage, currentMonth, pendingAction]
  );

  const handleConfirmAction = useCallback(async (overrides?: Record<string, unknown>) => {
    if (!pendingAction) return;
    setIsExecuting(true);

    try {
      const result = await executeActionMutation({
        userMessage: pendingAction.userMessage,
        month: pendingAction.month,
        actionType: pendingAction.actionType as "addTransaction" | "createGoal" | "contributeToGoal" | "setBudgetLimit",
        params: { ...pendingAction.params, ...overrides },
      });

      setLocalMessages((prev) => [
        ...prev,
        { id: `confirm-${Date.now()}`, role: "assistant", content: result.message },
      ]);
      setPendingAction(null);
    } catch (err) {
      console.error("Action execution error:", err);
      setError({ message: t.ERROR_ACTION_EXECUTION, retryMessage: pendingAction.userMessage });
      setPendingAction(null);
    } finally {
      setIsExecuting(false);
    }
  }, [executeActionMutation, pendingAction]);

  const handleCancelAction = useCallback(() => {
    setPendingAction(null);
    setLocalMessages((prev) => [
      ...prev,
      { id: `cancel-${Date.now()}`, role: "assistant", content: t.ACTION_CANCELLED },
    ]);
  }, []);

  const handleRetry = useCallback(() => {
    if (!error) return;
    const retryMsg = error.retryMessage;
    setError(null);
    if (retryMsg) handleSend(retryMsg);
  }, [error, handleSend]);

  return (
    <div id="chat-page">
      {/* Left: Chat Thread */}
      <div className="left-panel relative pb-24 h-[calc(100vh-6rem)] flex flex-col">
        {/* Mobile Header (Chat Page Only) */}
        <div className="lg:hidden flex justify-between items-center px-6 pt-2 pb-4">
          <h1 className="font-h3 text-h3 text-on-surface">Ipon AI</h1>
          <Sheet>
            <SheetTrigger render={<button className="text-on-surface-variant hover:text-primary transition-colors p-2 hover:bg-primary/5 rounded-full" type="button" aria-label="View Monthly Context" />}>
              <span className="material-symbols-outlined text-xl" aria-hidden="true">analytics</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] sm:w-[400px] overflow-y-auto pt-10">
              <MonthlyChatContext currentMonth={currentMonth} />
            </SheetContent>
          </Sheet>
        </div>

        {/* Suggestion Chips */}
        <SuggestionChips
          currentMonthName={currentMonthName}
          topSpendingCategory={topSpendingCategory}
          onChipClick={handleSend}
        />

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col h-full">
          {allMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary text-2xl" aria-hidden="true">auto_awesome</span>
              </div>
              <p className="font-body-sm text-on-surface-variant max-w-sm mx-auto">{t.EMPTY_STATE}</p>
            </div>
          )}

          {allMessages
            .filter((msg) => !msg.content.startsWith("[SYSTEM:"))
            .map((msg) => (
            <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
          ))}

          {/* Pending action confirmation card */}
          {pendingAction && (
            <ActionConfirmationCard
              action={pendingAction}
              onConfirm={handleConfirmAction}
              onCancel={handleCancelAction}
              isExecuting={isExecuting}
            />
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-[85%] self-start">
              <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0 mt-1">
                <span className="material-symbols-outlined text-on-primary-container text-sm" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">auto_awesome</span>
              </div>
              <div className="chat-bubble-ai-text">
                <span className="animate-pulse">{t.LOADING}</span>
              </div>
            </div>
          )}

          {/* Error bubble with retry */}
          {error && (
            <div className="flex gap-3 max-w-[85%] self-start">
              <div className="w-8 h-8 rounded-full bg-error/20 flex items-center justify-center shrink-0 mr-3">
                <span className="material-symbols-outlined text-error text-sm" aria-hidden="true">error</span>
              </div>
              <div className="bg-error/5 border border-error/20 rounded-2xl rounded-bl-md px-4 py-3 text-sm">
                <p className="text-error font-medium">{error.message}</p>
                <button onClick={handleRetry} className="mt-2 text-xs text-primary font-label-md hover:underline">
                  {t.ERROR_RETRY}
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-4 w-full shrink-0" />
        </div>

        {/* Input Bar */}
        <ChatInput onSend={handleSend} disabled={isLoading || isExecuting} />
      </div>

      {/* Right: Monthly Context Panel (Desktop) */}
      <div className="right-panel hidden lg:block p-6">
        <MonthlyChatContext currentMonth={currentMonth} />
      </div>
    </div>
  );
}
