import type { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function RecipientRequiredTooltip({
  children,
  message,
}: {
  children: ReactNode;
  message?: string;
}) {
  if (!message) return children;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="block w-full" tabIndex={0}>
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{message}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
