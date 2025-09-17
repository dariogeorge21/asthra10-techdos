"use client";

import { useEffect, useRef } from "react";
import { HelpCircle, Target, CheckCircle, SkipForward } from "lucide-react";
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

    // Focus the primary close button for accessibility
    closeBtnRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
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
        onClick={() => onClose()}
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
              <HelpCircle className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <CardTitle id="level-rules-title" className="text-lg font-bold">
                Level 19 — Game Rules
              </CardTitle>
              <div className="text-sm text-gray-600">Quick summary of mechanics and scoring</div>
            </div>
          </div>

          

        </CardHeader>

        <CardContent className="px-6 pb-6 space-y-4">
          {/* Objective */}
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                <Target className="h-4 w-4 mr-1" />
                Objective
              </Badge>
            </h3>
            <p className="text-sm text-gray-600">
              You will be shown a famous personality (scientist, leader, artist, writer, etc.).
              Select the correct fact about that personality from four multiple-choice options.
            </p>
          </section>

          {/* Scoring */}
          <section className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100">
                <CheckCircle className="h-4 w-4 mr-1" />
                Scoring System
              </Badge>
            </h4>

            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li>Correct answers award standard points; exact points are applied at level completion.</li>
              <li>Using a hint reduces the score for that question (hint penalty applies).</li>
              <li>Skipping a question applies a penalty to your score.</li>
              <li>Answering multiple questions correctly in a row grants streak bonus points.</li>
            </ul>
          </section>

          {/* Actions */}
          <section className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-100">
                <SkipForward className="h-4 w-4 mr-1" />
                Gameplay Hints
              </Badge>
            </h4>

            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li>Use Show Hint if unsure — it helps but lowers points for that question.</li>
              <li>Use Skip Question to move on, but a skip penalty will be applied.</li>
              <li>Try to build correct-answer streaks to earn extra bonus points.</li>
            </ul>
          </section>

          {/* Reminder */}
          

          <div className="flex justify-end pt-3">
            <Button 
              ref={closeBtnRef}
              onClick={() => {
                localStorage.setItem('level19_rules_shown', 'true');
                onClose();
              }} 
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Start Level 19
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
