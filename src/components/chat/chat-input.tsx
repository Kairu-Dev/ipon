"use client";
// src/components/chat/chat-input.tsx
// Chat input bar with character counter and send button.

import { useState, useRef } from "react";
import { CHAT_STRINGS as t } from "@/locale/chat";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

  const capabilities = [
    { icon: "receipt_long", title: "Log Transactions", desc: "Quickly track your money. Say 'I spent ₱500 on Jollibee' or 'Got my ₱15000 salary'." },
    { icon: "account_balance_wallet", title: "Manage Budgets", desc: "Set limits to control your spending. Say 'Set my food budget to ₱5000'." },
    { icon: "flag", title: "Create Savings Goals", desc: "Plan for the future. Say 'Create a goal for a new laptop for ₱50000'." },
    { icon: "savings", title: "Contribute to Goals", desc: "Update your progress. Say 'Add ₱1000 to my laptop goal'." },
    { icon: "monitoring", title: "Smart Affordability Check", desc: "Ask 'Can I afford a ₱200 coffee?' Ipon AI checks your actual remaining balance and budget limits to give a safe, realistic verdict." },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 bg-surface-container-lowest border-t border-slate-100">
      <div className="max-w-3xl mx-auto relative flex items-center">
        <Dialog>
          <DialogTrigger render={<button className="absolute left-3 text-on-surface-variant transition-colors p-2 hover:text-primary hover:bg-primary/5 rounded-full" type="button" aria-label="Help Guide" />}>
              <span className="material-symbols-outlined text-xl" aria-hidden="true">help</span>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <span className="material-symbols-outlined text-primary" aria-hidden="true">auto_awesome</span>
                Ipon AI Capabilities
              </DialogTitle>
              <DialogDescription>
                Here are some things you can ask Ipon to do for you.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {capabilities.map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-3 rounded-lg bg-surface-container-lowest border border-slate-100 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary" aria-hidden="true">{item.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-label-md text-on-surface mb-1">{item.title}</h4>
                    <p className="font-body-sm text-on-surface-variant leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
        
        <input 
          className="input-bar pl-12" 
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
