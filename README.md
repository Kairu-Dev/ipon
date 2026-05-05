# Ipon 🌱

> *Ipon* (Filipino, /i·pon/) — *to save money*

A personal finance tracker for Filipino students and working adults. Track daily expenses, set savings goals, manage monthly budgets, and get AI-powered insights to build better financial habits.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16.2.4 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Database + Backend | Convex |
| Auth | Convex Auth |
| AI | Gemini API |
| Hosting | Vercel |
| Unit Testing | Vitest |
| E2E Testing | Playwright |

---

## Features

- 📊 **Dashboard** — Monthly income, expenses, and remaining balance at a glance
- 💸 **Transactions** — Log and filter income and expenses by category
- 🎯 **Savings Goals** — Create goals, track progress, and contribute funds
- 📋 **Budget** — Set monthly limits per category with visual warning states
- 🤖 **AI Chat** — Ask questions about your finances powered by Gemini
- ✨ **AI Insights** — Automatic spending analysis on your dashboard

---

## Getting Started

### Prerequisites

- Node.js 20.9 or higher
- npm 10+

### Installation

```bash
# Clone the repository
git clone https://github.com/KyleSoliman/ipon.git
cd ipon

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Fill in your NEXT_PUBLIC_CONVEX_URL and AUTH_SECRET

# Start Convex dev server (in a separate terminal)
npx convex dev

# Start the development server
npm run dev
```

Open <http://localhost:3000> to view the app.

---

## Scripts

```bash
npm run dev            # Start development server
npm run build          # Build for production
npm run test           # Run unit tests (Vitest)
npm run test:e2e       # Run end-to-end tests (Playwright)
npm run test:coverage  # Run tests with coverage report
```

---

## Project Structure

```text
ipon/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # Reusable UI components
│   ├── lib/              # Utility functions
│   └── test/             # Vitest setup
├── convex/               # Convex backend functions + schema
├── e2e/                  # Playwright E2E tests
└── public/               # Static assets
```

---

## Development

This project follows agile methodology with 2-week sprints.

| Sprint | Focus | Status |
| --- | --- | --- |
| Sprint 0 | Project setup & foundation | ✅ Complete |
| Sprint 1 | Auth + transactions core | 🔄 In Progress |
| Sprint 2 | History, goals & dashboard | ⏳ Planned |
| Sprint 3 | Budget + AI features | ⏳ Planned |
| Sprint 4 | Polish, testing & launch | ⏳ Planned |