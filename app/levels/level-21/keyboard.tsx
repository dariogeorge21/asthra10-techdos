import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface KeyboardProps {
  layout: string[][];
  onKeyPress: (key: { key: string; isSpecial?: boolean }) => void;
  className?: string;
}

export function Keyboard({ layout, onKeyPress, className }: KeyboardProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      {layout.map((row, i) => (
        <div key={i} className="flex justify-center gap-1.5">
          {row.map((key) => {
            const isSpecial = ['Space', 'Backspace', 'Enter'].includes(key);
            return (
              <Button
                key={key}
                variant="outline"
                className={cn(
                  "h-12 min-w-[2.5rem] font-medium transition-all",
                  "border-blue-200 text-blue-700 hover:bg-blue-50",
                  "active:bg-blue-100 active:scale-95",
                  isSpecial && "px-4 min-w-[4rem]"
                )}
                onClick={() => onKeyPress({ 
                  key: key === "Space" ? " " : key,
                  isSpecial 
                })}
              >
                {key === "Space" ? "Space" : 
                 key === "Backspace" ? "⌫" : 
                 key }
              </Button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
