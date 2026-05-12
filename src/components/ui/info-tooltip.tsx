"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Info } from "lucide-react";
import { useState } from "react";

interface InfoTooltipProps {
  content: string;
  children?: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
}

export function InfoTooltip({ content, children, side = "top" }: InfoTooltipProps) {
  const [isTouchDevice] = useState(
    () => typeof window !== "undefined"
      ? window.matchMedia("(hover: none)").matches
      : false
  );

  const triggerClassName = "inline-flex items-center gap-1 cursor-pointer outline-none text-left";

  const triggerContent = (
    <>
      {children}
      <Info className="w-3 h-3 text-amber-400 shrink-0" />
    </>
  );

  // Touch devices (mobile/tablet) — use Popover (tap to open, tap to close)
  if (isTouchDevice) {
    return (
      <Popover>
        <PopoverTrigger render={<button type="button" />} className={triggerClassName}>
          {triggerContent}
        </PopoverTrigger>
        <PopoverContent
          side={side}
          className="max-w-[220px] text-center font-body-sm text-body-sm bg-primary text-on-primary border-none p-3"
        >
          {content}
        </PopoverContent>
      </Popover>
    );
  }

  // Desktop — use Tooltip (hover)
  // Use Base UI's delay prop instead of delayDuration
  return (
    <TooltipProvider delay={300}>
      <Tooltip>
        <TooltipTrigger render={<button type="button" />} className={triggerClassName}>
          {triggerContent}
        </TooltipTrigger>
        <TooltipContent
          side={side}
          className="max-w-[220px] text-center font-body-sm text-body-sm bg-primary text-on-primary border-none p-3"
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
