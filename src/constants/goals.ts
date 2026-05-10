import { Plane, Laptop, Home, Heart, Star, Gift } from "lucide-react";

export const GOAL_ICONS = [
  { value: "plane",   label: "Travel",    icon: "plane"   },
  { value: "laptop",  label: "Tech",      icon: "laptop"  },
  { value: "home",    label: "Home",      icon: "home"    },
  { value: "heart",   label: "Health",    icon: "heart"   },
  { value: "star",    label: "Personal",  icon: "star"    },
  { value: "gift",    label: "Gift",      icon: "gift"    },
] as const;

export const GOAL_ICON_MAP = {
  plane:  Plane,
  laptop: Laptop,
  home:   Home,
  heart:  Heart,
  star:   Star,
  gift:   Gift,
} as const;
