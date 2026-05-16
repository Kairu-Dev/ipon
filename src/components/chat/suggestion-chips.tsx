"use client";
// src/components/chat/suggestion-chips.tsx
// Context-aware suggestion chips shown before the first message.
// Tapping a chip populates the input AND immediately sends the message.



interface SuggestionChipsProps {
  currentMonthName: string;
  topSpendingCategory: string | null;
  onChipClick: (message: string) => void;
}

export function SuggestionChips({
  currentMonthName,
  topSpendingCategory,
  onChipClick,
}: SuggestionChipsProps) {
  const chips = [
    { text: "Can I afford a ₱3,000 purchase?", icon: "shopping_cart" },
    { text: `Summarize my ${currentMonthName} spending`, icon: "summarize" },
    topSpendingCategory 
      ? { text: `How to lower ${topSpendingCategory} spending?`, icon: "trending_down" } 
      : { text: "Set a Food & Dining budget to ₱5000", icon: "tune" },
  ];

  return (
    <div className="p-4 flex gap-2 overflow-x-auto whitespace-nowrap border-b border-slate-100 bg-surface-container-lowest z-10 shrink-0 scrollbar-hide">
      {chips.map((chip) => (
        <button
          key={chip.text}
          onClick={() => onChipClick(chip.text)}
          className="suggestion-chip"
        >
          <span className="material-symbols-outlined text-base text-primary" aria-hidden="true">{chip.icon}</span>
          {chip.text}
        </button>
      ))}
    </div>
  );
}
