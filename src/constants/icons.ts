// src/constants/icons.ts
// Shared mapping from category icon string → Lucide component.
// Used by AddTransactionModal, TransactionRow, and BudgetCategoryRow.
import {
  Utensils,
  Bus,
  Wifi,
  Home,
  ShoppingBag,
  MoreHorizontal,
  Briefcase,
  Layout,
  Monitor,
  PiggyBank,
  Plane,
  Laptop,
  Star,
  Heart,
  Gift,
} from "lucide-react";

export const ICON_MAP = {
  utensils: Utensils,
  bus: Bus,
  wifi: Wifi,
  home: Home,
  "shopping-bag": ShoppingBag,
  "more-horizontal": MoreHorizontal,
  briefcase: Briefcase,
  layout: Layout,
  monitor: Monitor,
  "piggy-bank": PiggyBank,
  plane: Plane,
  laptop: Laptop,
  star: Star,
  heart: Heart,
  gift: Gift,
} as const;
