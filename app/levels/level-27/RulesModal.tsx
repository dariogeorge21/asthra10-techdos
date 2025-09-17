"use client";

import { useEffect, useRef } from "react";
import { Target, CheckCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function RulesModal({ open, onClose }: Props) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    closeBtnRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      aria-hidden={!open}
    >
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <Card
        role="dialog"
        aria-modal="true"
        aria-labelledby="level-rules-title"
        className="relative max-w-2xl w-full z-[110] transform rounded-lg shadow-xl"
      >
        <CardHeader className="flex items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="bg-purple-50 rounded-full p-2">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <CardTitle id="level-rules-title" className="text-xl font-bold">
                Welcome to Badly Explained but Actually Fun-Hard! Level 27
              </CardTitle>
              <div className="text-sm text-gray-600">Level 27 - How to Play</div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-6 space-y-6">
          {/* Main Description */}
          <div className="text-gray-600 space-y-4">
            <p className="text-lg">
              Each question is written in a weird, over-simplified, or totally silly way 🤯
            </p>
            <p>
              Your mission: figure out what it really means and pick the correct answer.
            </p>
          </div>

          {/* Scoring Rules */}
          <section className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100">
                <CheckCircle className="h-4 w-4 mr-1" />
                Scoring Rules
              </Badge>
            </h4>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
              <li>Use Hints if youre stuck (but lose some points) 💡</li>
              <li>Wrong guesses & skips = point deductions ❌</li>
              <li>Get streaks for bonus points 🔥</li>
            </ul>
          </section>

          {/* Pro Tip */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-700 flex items-center gap-2 mb-2">
              <Target className="h-4 w-4" />
              Pro Tip
            </h4>
            <p className="text-blue-600 text-sm">
              Dont take the wording literally — its badly explained on purpose!
            </p>
          </div>

          <div className="flex justify-end pt-3">
            <Button 
              ref={closeBtnRef}
              onClick={() => {
                localStorage.setItem('level27_rules_shown', 'true');
                onClose();
              }} 
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Got it! Start Level 27
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
