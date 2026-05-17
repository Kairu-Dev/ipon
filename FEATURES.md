# Ipon: Current Features & Capabilities

This document outlines the **exact, currently implemented capabilities** of the Ipon application, broken down by page and feature. It serves as a strict guide to what the application can do today.

---

## 🔐 1. Authentication & Security
*   **Email/Password Auth:** Users can securely sign up and log in using email and password via Convex Auth.
*   **Session Management:** Secure, persistent cookie-based sessions with automatic mid-session expiry detection.
*   **Two-Layer Route Protection:**
    *   **Middleware (`proxy.ts`):** Redirects unauthenticated users away from `/dashboard` before the page loads.
    *   **Client Watcher (`SessionWatcher`):** Continuously monitors auth state and gracefully kicks users out if their session expires while using the app.

---

## 📊 2. Dashboard (`/dashboard`)
The command center for monthly financial overviews.
*   **Month Selection:** Users can toggle between months to view historical data.
*   **Financial Summary Cards:** Displays Total Income, Total Expenses, and Remaining Balance.
*   **Month-over-Month Trends:** Shows percentage increases or decreases (in green/red) compared to the previous month.
*   **"Safe to Spend" Algorithm:** Calculates exactly how much money the user can safely spend today based on their remaining budget and the days left in the month.
*   **AI Insights Panel:** An automated, single-click "Analyze" button that calls the AI (Gemini/Groq) to generate a personalized paragraph analyzing the user's spending habits for the current month.
*   **Spending Breakdown:** A visual list showing exactly where money was spent, grouped by category.
*   **Goals Preview:** A quick-glance widget showing progress on active savings goals.

---

## 💸 3. Transactions (`/dashboard/transactions`)
The core logging system for all money movement.
*   **Grouped List View:** All transactions are displayed in a list, automatically grouped by date (e.g., "Today", "Yesterday", "May 15").
*   **Manual Logging Modal:** Users can manually add transactions with the following fields:
    *   **Type:** Income or Expense
    *   **Amount:** Number (₱)
    *   **Title:** Short description (e.g., "Jollibee Lunch")
    *   **Category:** Selected from predefined constant lists (e.g., Food & Dining, Transportation, Salary).
    *   **Payment Method:** Cash, GCash, Debit Card, Credit Card, Bank Transfer.
    *   **Date:** ISO Date picker.
*   **Visual Indicators:** Income is rendered in green (`+`), expenses in red (`-`), accompanied by category-specific icons.

---

## 📋 4. Budgeting (`/dashboard/budget`)
Category-based spending limits.
*   **Set Monthly Limits:** Users can assign a strict monetary limit to any predefined expense category.
*   **Visual Progress Tracking:** Shows a progress bar filling up as transactions are logged against that category.
*   **Warning States:**
    *   **Normal:** Bar is standard color (<80% spent).
    *   **Warning:** Bar turns yellow/orange when nearing the limit (80% - 99%).
    *   **Danger:** Bar turns red when the budget is exceeded (100%+).

---

## 🎯 5. Savings Goals (`/dashboard/savings-goals`)
Dedicated tracking for future purchases or emergency funds.
*   **Create Goals:** Users can create a goal with a Name, Target Amount, Target Deadline, and select a visual Material Icon to represent it.
*   **Contribute Funds:** A dedicated slide-out sheet allows users to "deposit" money into a specific goal. *(Note: Goal contributions are automatically logged as a special system expense so they deduct from the user's overall dashboard balance).*
*   **Visual Progress:** Each goal displays a percentage completion bar and the remaining amount needed to hit the target.

---

## 🤖 6. AI Financial Assistant (`/dashboard/chat`)
A conversational agent capable of autonomously interacting with the database.
*   **Context-Aware Chat:** The AI reads the user's current monthly totals, budgets, and goals before answering.
*   **Agentic Actions (Tool Calling):** The AI cannot blindly mutate data. Instead, it generates **Confirmation Cards** on the UI for the user to approve. It can autonomously trigger cards to:
    1.  **Log a Transaction:** Predicts the category and title based on natural language (e.g., "I bought coffee for 150").
    2.  **Set a Budget Limit:** (e.g., "Limit my food spending to 5000").
    3.  **Create a Savings Goal:** (e.g., "I want to save 50k for a laptop by December").
    4.  **Contribute to a Goal:** (e.g., "Add 500 to my laptop goal").
    5.  **Show Visual Progress:** Can render an inline progress card for a specific goal during conversation.
*   **Strict Guardrails:** 
    *   If a user asks the AI to act but forgets a required detail (like the exact Amount or Deadline), the AI is strictly programmed to **stop and ask** for the missing detail (formatting it in **bold**) rather than hallucinating a guess.
    *   When the AI drafts a transaction, it defaults the payment method to "Cash", but provides an interactive dropdown on the confirmation card so the user can change it to GCash/Card before finalizing.
*   **Action Memory:** The AI immediately remembers requests that generate confirmation cards. If a user cancels a card and asks for an edit (e.g., "Change the amount to 600"), the AI successfully retains the context of the previous request.
*   **Monthly Context Panel:** On desktop (right panel) and mobile (slide-out sheet), the chat page displays a live snapshot of the user's income, expenses, top spending category, and 4 most recent transactions to ground the conversation.
