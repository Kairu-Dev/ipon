# Ipon 🌱

> *Ipon* (Filipino, /i·pon/) — *to save money*

Ipon is a modern, AI-powered personal finance tracker designed specifically for Filipino students and working adults. It helps you track daily expenses, set and achieve savings goals, manage monthly budgets, and gain actionable financial insights to build better money habits.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Convex](https://img.shields.io/badge/Convex-Backend-ff5a5f?style=flat)](https://www.convex.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini API](https://img.shields.io/badge/AI-Gemini_API-blue?style=flat&logo=google-gemini)](https://ai.google.dev/)
[![Groq API](https://img.shields.io/badge/AI-Groq_API-f55036?style=flat)](https://groq.com/)

---

## ✨ Features

- 📊 **Dynamic Dashboard:** A high-level overview of your monthly income, expenses, and remaining balance at a glance.
- 💸 **Transaction Tracking:** Effortlessly log and filter income and expenses by category, date, and payment method (Cash, GCash, Bank Transfer, etc.).
- 🎯 **Savings Goals:** Create custom savings goals with target amounts, deadlines, and visual progress tracking.
- 📋 **Budget Management:** Set monthly spending limits per category. Visual warning states alert you when you're nearing or exceeding your limits.
- 🤖 **AI Financial Assistant:** An agentic AI chat powered by Gemini and Groq that can answer questions about your finances, and autonomously perform actions like logging transactions, creating goals, or setting budgets.
- 🧠 **AI Insights:** Automated, personalized spending analysis directly on your dashboard.
- 📱 **Fully Responsive:** Beautifully optimized for both desktop and mobile devices.
- 📈 **Analytics & Reports (Coming Soon):** Deep-dive visual charts, custom date ranges, and advanced export capabilities for your financial data.

---

## 🛠 Tech Stack

Ipon is built with a modern, serverless architecture focusing on real-time data sync and an optimal developer experience.

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16.2.4 (App Router) |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Database & Backend** | [Convex](https://www.convex.dev/) (Real-time BaaS) |
| **Authentication** | Convex Auth (Email/Password) |
| **State Management** | Zustand (UI State) |
| **AI Integration** | Google Gemini API & Groq API |
| **Hosting** | Vercel |
| **Unit Testing** | Vitest |
| **E2E Testing** | Playwright |

---

## 🏗 Architecture & Design Decisions

- **State Management Split:** 
  - **Auth State:** Handled exclusively via Convex Auth hooks (`useConvexAuth`, `useCurrentUser`).
  - **Server Data:** Managed through Convex queries and mutations.
  - **UI State:** Handled by Zustand (e.g., filters, modals, UI toggles).
- **Authentication:** Sessions are stored securely in cookies using `@convex-dev/auth/nextjs` with a robust two-layer route protection system (`proxy.ts` middleware and client-side `SessionWatcher`).
- **AI Agentic Flow:** The AI models (Gemini & Groq) are deeply integrated with Convex actions. The AI can execute tools to interact with your data, but is strictly guardrailed. It explicitly asks for missing required information (like transaction amounts or goal deadlines) before acting, ensuring data integrity without hallucination.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20.9 or higher
- npm 10+
- A Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/KyleSoliman/ipon.git
   cd ipon
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   *Note: You will need to fill in your `NEXT_PUBLIC_CONVEX_URL`, `AUTH_SECRET`, `GEMINI_API_KEY`, and `GROQ_API_KEY`.*

4. **Initialize Convex (in a separate terminal):**
   ```bash
   npx convex dev
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📂 Project Structure

```text
ipon/
├── src/
│   ├── app/                     # Next.js App Router pages and layouts
│   │   ├── (auth)/              # Login, sign-up, forgot password pages
│   │   └── dashboard/           # Protected dashboard pages
│   │       ├── budget/
│   │       ├── chat/
│   │       ├── savings-goals/
│   │       └── transactions/
│   ├── components/              # UI components organized by feature
│   │   ├── auth/                # Login and sign-up forms, session watcher
│   │   ├── budget/              # Budget rows, summary cards, category modal
│   │   ├── chat/                # Chat bubbles, suggestion chips, confirmation cards
│   │   ├── dashboard/           # Summary cards, goals preview, spending breakdown
│   │   ├── goals/               # Goal cards, contribution sheet, goal grid
│   │   ├── transactions/        # Transaction list, row, modal, empty state
│   │   └── ui/                  # shadcn/ui primitives (Button, Dialog, Input, etc.)
│   ├── constants/               # App-wide constants (categories, icons, payment methods)
│   │   ├── budget.ts
│   │   ├── goals.ts
│   │   ├── icons.ts
│   │   └── transactions.ts
│   ├── lib/                     # Pure utility functions — no side effects
│   │   ├── finance/             # Financial calculations (budget, goals, transactions, dashboard)
│   │   │   ├── budget.ts        # getBudgetStatus, getBudgetPercentage, calculateTotalBudget
│   │   │   ├── goals.ts         # calculateGoalProgress
│   │   │   ├── transactions.ts  # groupByDate
│   │   │   ├── dashboard.ts     # calculateSafeToSpend, getMonthOverMonthDates
│   │   │   └── index.ts         # barrel export
│   │   ├── validation/          # Zod schemas for all forms
│   │   │   ├── schemas.ts       # transactionSchema, createGoalSchema, contributeGoalSchema
│   │   │   └── index.ts         # barrel export
│   │   ├── gemini-parser.ts     # Parses and validates Gemini API category suggestions
│   │   ├── formatters.ts        # formatCurrency, formatGoalDate
│   │   └── utils.ts             # shadcn cn() utility
│   ├── locale/                  # UI string constants organized by feature
│   │   ├── auth.ts
│   │   ├── budget.ts
│   │   ├── chat.ts
│   │   ├── dashboard.ts
│   │   ├── goals.ts
│   │   └── transactions.ts
│   ├── store/                   # Zustand UI state (modal open/close, selected IDs)
│   │   └── ui-store.ts
│   └── test/                    # Vitest setup file
│       └── setup.ts
├── convex/                      # Convex backend — schema, queries, mutations, actions
│   ├── schema.ts                # Database table definitions and indexes
│   ├── auth.ts                  # Convex Auth — Password provider configuration
│   ├── transactions.ts          # addTransaction, getTransactions, getTotals, getMonthOverMonthTrend
│   ├── budgets.ts               # getBudgets, saveBudgets, getSpentPerCategory
│   ├── goals.ts                 # createGoal, getGoals, contributeToGoal
│   ├── insights.ts              # generateInsight, getInsight — AI spending analysis
│   ├── chat.ts                  # sendMessage, executeAction, getChatHistory — AI chat engine
│   ├── users.ts                 # getCurrentUser
│   ├── crons.ts                 # Scheduled jobs (clear old chat messages)
│   ├── constants.ts             # Shared server constants (SAVINGS_CATEGORY)
│   └── lib/
│       └── gemini/              # Gemini API integration
│           ├── client.ts        # askGemini — base Gemini API wrapper
│           ├── chat.ts          # askGeminiChat — chat with tool/function calling support
│           ├── prompts.ts       # System prompts and insight prompt builder
│           └── index.ts         # barrel export
├── e2e/                         # Playwright end-to-end tests
├── standards/                   # Engineering standards and conventions
│   ├── code-conventions.md
│   ├── convex-patterns.md
│   ├── nextjs-conventions.md
│   ├── separation-of-concerns.md
│   ├── state-management.md
│   └── yagni-and-scope.md
└── proxy.ts                     # Next.js 16 route protection (renamed from middleware.ts)
```

---

## 🧪 Testing

Ipon maintains a robust testing suite to ensure stability.

```bash
npm run test           # Run unit tests via Vitest
npm run test:e2e       # Run End-to-End tests via Playwright
npm run test:coverage  # Run tests with a detailed coverage report
```

---

## 🚢 Deployment

The frontend is optimized for deployment on **Vercel**, while the backend relies on **Convex's** production servers. Ensure that you have set your production environment variables in both the Vercel dashboard and the Convex dashboard before deploying.

---
*Built with ❤️ for better financial habits.*
