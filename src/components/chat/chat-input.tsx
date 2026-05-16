"use client";
// src/components/chat/chat-input.tsx
// Chat input bar with character counter and send button.

import { useState, useRef } from "react";
import { CHAT_STRINGS as t } from "@/locale/chat";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 bg-surface-container-lowest border-t border-slate-100">
      <div className="max-w-3xl mx-auto relative flex items-center">
        <button className="absolute left-3 text-on-surface-variant transition-colors p-2 opacity-40 cursor-not-allowed" type="button" aria-label="Add conversation" disabled>
          <span className="material-symbols-outlined" aria-hidden="true">add_circle</span>
        </button>
        <input 
          className="input-bar" 
          placeholder={t.INPUT_PLACEHOLDER}
          type="text" 
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-label="Ask about your finances"
          ref={textareaRef}
        />
        <button 
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className="absolute right-3 bg-primary text-on-primary w-8 h-8 rounded-full flex items-center justify-center hover:bg-primary-container transition-colors disabled:opacity-50 disabled:bg-surface-variant" 
          type="button" 
          aria-label="Send message"
        >
          <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_upward</span>
        </button>
      </div>
    </div>
  );
}
