"use client";

// src/components/budget/income-allocated-card.tsx
// Shows what percentage of monthly income is allocated to budgets,
// with a recharts donut chart and unallocated funds display.
import { PieChart, Pie, Cell } from "recharts";
import { formatCurrency } from "@/lib/formatters";
import { BUDGET_STRINGS as t } from "@/locale/budget";

interface IncomeAllocatedCardProps {
  totalAllocated: number;
  totalIncome: number;
}

export function IncomeAllocatedCard({ totalAllocated, totalIncome }: IncomeAllocatedCardProps) {
  const percentage = totalIncome > 0
    ? Math.min(Math.round((totalAllocated / totalIncome) * 100), 100)
    : 0;
  const unallocated = Math.max(0, totalIncome - totalAllocated);
  const isOverAllocated = totalAllocated > totalIncome;

  // Donut chart data: filled portion and empty portion
  const data = [
    { value: percentage },
    { value: 100 - percentage },
  ];

  return (
    <div className="summary-card-secondary">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-h3 text-h3 text-on-surface">{t.INCOME_TITLE}</h3>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-label-xs text-label-xs border ${
            isOverAllocated
              ? "bg-error/10 text-error border-error/20"
              : "bg-primary/10 text-primary border-primary/20"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
              isOverAllocated ? "bg-error" : "bg-primary"
            }`}
          ></span>
          {isOverAllocated ? t.INCOME_OVER_ALLOCATED : t.INCOME_ON_TRACK}
        </span>
      </div>

      {/* Donut Chart — recharts, no shadcn ChartContainer */}
      <div className="flex-1 flex flex-col justify-center items-center text-center py-4">
        <div className="relative w-[120px] h-[120px]">
          <PieChart width={120} height={120}>
            <Pie
              data={data}
              innerRadius={38}
              outerRadius={52}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              strokeWidth={0}
            >
              <Cell fill="var(--color-primary)" />
              <Cell fill="var(--color-surface-container)" />
            </Pie>
          </PieChart>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-currency text-currency text-on-surface">{percentage}%</span>
            <span className="font-label-xs text-label-xs text-on-surface-variant">
              {t.INCOME_ALLOCATED}
            </span>
          </div>
        </div>
      </div>

      <div className="text-center font-body-sm text-body-sm text-on-surface-variant">
        {formatCurrency(unallocated)} {t.INCOME_UNALLOCATED_SUFFIX}
      </div>
    </div>
  );
}
