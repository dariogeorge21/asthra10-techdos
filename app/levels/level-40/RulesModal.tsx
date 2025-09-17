/**
 * LEVEL-40 RULES MODAL COMPONENT
 * 
 * Modal component that displays the Final Boss Challenge rules and instructions
 * for the typing test game. Follows the same pattern as other level modals.
 */

"use client";

import { useEffect, useRef } from "react";
import { HelpCircle, Target, CheckCircle, Timer, Zap, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  open: boolean;
  onClose: () => void;
  onStartGame: () => void;
}

export default function RulesModal({ open, onClose, onStartGame }: Props) {
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
        className="relative max-w-3xl w-full z-[110] transform rounded-lg shadow-xl"
      >
        <CardHeader className="flex items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="bg-red-50 rounded-full p-2">
              <HelpCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <CardTitle id="level-rules-title" className="text-xl font-bold">
                Level 40 — Final Boss Challenge
              </CardTitle>
              <div className="text-sm text-gray-600">Typing Test Master Challenge</div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-6 space-y-4">
          {/* Challenge Overview */}
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-100">
                <Target className="h-4 w-4 mr-1" />
                Final Challenge
              </Badge>
            </h3>
            <p className="text-sm text-gray-600">
              Welcome to the ultimate TechDOS challenge! This is a 30-second typing test where you must 
              type random words and sentences as quickly and accurately as possible. This is your final 
              test to become a TechDOS Master Champion.
            </p>
          </section>

          {/* Game Rules */}
          <section className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                <Timer className="h-4 w-4 mr-1" />
                Game Rules
              </Badge>
            </h4>

            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li><strong>Duration:</strong> Exactly 30 seconds - the timer starts when you begin typing</li>
              <li><strong>Content:</strong> Random words and sentences will be displayed for you to type</li>
              <li><strong>Real-time Feedback:</strong> Correct characters appear in green, incorrect in red</li>
              <li><strong>Auto-advance:</strong> Press spacebar to move to the next word</li>
              <li><strong>Single Play:</strong> This challenge can only be attempted ONCE per session</li>
            </ul>
          </section>

          {/* Scoring System */}
          <section className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100">
                <CheckCircle className="h-4 w-4 mr-1" />
                Scoring System
              </Badge>
            </h4>

            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li><strong>WPM Calculation:</strong> (Correct characters ÷ 5) ÷ (time elapsed in minutes)</li>
              <li><strong>Base Score:</strong> 50 points per correct character typed</li>
              <li><strong>Accuracy Bonus:</strong> 1000 pts for 90%+, 500 pts for 80%+ accuracy</li>
              <li><strong>Speed Bonus:</strong> 1500 pts for 60+ WPM, 1000 pts for 40+ WPM, 500 pts for 20+ WPM</li>
              <li><strong>Live Updates:</strong> Watch your WPM and accuracy update in real-time</li>
            </ul>
          </section>

          {/* Strategy Tips */}
          <section className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-100">
                <Zap className="h-4 w-4 mr-1" />
                Pro Tips
              </Badge>
            </h4>

            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li>Focus on accuracy first - incorrect characters hurt your score</li>
              <li>Use proper typing technique with all fingers</li>
              <li>Don&apos;t look at the keyboard - keep your eyes on the screen</li>
              <li>Stay calm and maintain a steady rhythm</li>
              <li>Use the spacebar to advance to the next word when ready</li>
            </ul>
          </section>

          {/* Final Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-red-600" />
              <h4 className="font-semibold text-red-700">Important Notice</h4>
            </div>
            <p className="text-sm text-red-600">
              This is the FINAL LEVEL of TechDOS. Once you start, you cannot restart or replay this challenge. 
              Make sure you&apos;re ready and in a quiet environment before beginning!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-3">
            <Button 
              variant="outline"
              onClick={() => {
                localStorage.setItem('level40_rules_shown', 'true');
                onClose();
              }}
              className="border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Not Ready Yet
            </Button>
            
            <Button 
              ref={closeBtnRef}
              onClick={() => {
                localStorage.setItem('level40_rules_shown', 'true');
                onStartGame();
              }} 
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8"
            >
              <Zap className="h-4 w-4 mr-2" />
              Start Final Challenge
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
