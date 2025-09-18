"use client";

import { useEffect, useRef } from "react";
import { HelpCircle, Grid3X3, CheckCircle, Lightbulb, Hash, Target } from "lucide-react";
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
        className="relative max-w-4xl w-full max-h-[90vh] z-[110] transform rounded-lg shadow-xl flex flex-col"
      >
        <CardHeader className="flex items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 rounded-full p-2">
              <HelpCircle className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <CardTitle id="level-rules-title" className="text-xl font-bold">
                Level 38 — Sudoku Challenge
              </CardTitle>
              <div className="text-sm text-gray-600">Solve the classic 9×9 number puzzle</div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-6 space-y-4 overflow-y-auto flex-1">
          {/* Challenge Overview */}
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100">
                <Grid3X3 className="h-4 w-4 mr-1" />
                Puzzle Challenge
              </Badge>
            </h3>
            <p className="text-sm text-gray-600">
              Welcome to the classic Sudoku challenge! Your goal is to fill a 9×9 grid with digits 1-9 
              following specific rules. This timeless puzzle tests your logical thinking and pattern 
              recognition skills. Some cells are pre-filled to get you started.
            </p>
          </section>

          {/* Sudoku Rules */}
          <section className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100">
                <Target className="h-4 w-4 mr-1" />
                Sudoku Rules
              </Badge>
            </h4>

            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li><strong>Fill the Grid:</strong> Every empty cell must contain a digit from 1 to 9</li>
              <li><strong>Row Rule:</strong> Each row must contain all digits 1-9 exactly once</li>
              <li><strong>Column Rule:</strong> Each column must contain all digits 1-9 exactly once</li>
              <li><strong>Box Rule:</strong> Each 3×3 sub-grid must contain all digits 1-9 exactly once</li>
              <li><strong>No Duplicates:</strong> No number can repeat in any row, column, or 3×3 box</li>
            </ul>
          </section>

          {/* How to Play */}
          <section className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                <Hash className="h-4 w-4 mr-1" />
                How to Play
              </Badge>
            </h4>

            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li><strong>Select a Cell:</strong> Click on any empty (white) cell to select it</li>
              <li><strong>Enter Numbers:</strong> Use the virtual number keyboard (1-9) to fill cells</li>
              <li><strong>Clear Mistakes:</strong> Use the &quot;Clear Cell&quot; button to remove numbers</li>
              <li><strong>Visual Feedback:</strong> Conflicts are highlighted in red automatically</li>
              <li><strong>Pre-filled Cells:</strong> Gray cells cannot be modified (puzzle clues)</li>
            </ul>
          </section>

          {/* Grid Layout */}
          <section className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-100">
                <Grid3X3 className="h-4 w-4 mr-1" />
                Grid Layout
              </Badge>
            </h4>

            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h5 className="font-medium mb-2">Visual Elements:</h5>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Gray cells:</strong> Pre-filled numbers (cannot change)</li>
                  <li><strong>Blue cells:</strong> Your filled numbers</li>
                  <li><strong>Red cells:</strong> Conflicting numbers</li>
                  <li><strong>Highlighted cell:</strong> Currently selected</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">Grid Structure:</h5>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>9×9 Grid:</strong> 81 total cells</li>
                  <li><strong>9 Sub-grids:</strong> Each 3×3 box outlined in thick borders</li>
                  <li><strong>9 Rows:</strong> Horizontal lines</li>
                  <li><strong>9 Columns:</strong> Vertical lines</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Hint System */}
          <section className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-100">
                <Lightbulb className="h-4 w-4 mr-1" />
                Hint System
              </Badge>
            </h4>

            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li>Select any empty cell and click &quot;Get Hint&quot; for the correct number</li>
              <li>Each hint costs 100 points from your final score</li>
              <li>Hints automatically fill the selected cell with the correct answer</li>
              <li>Use hints strategically when you&apos;re completely stuck</li>
              <li>Try to solve as much as possible without hints for maximum score</li>
            </ul>
          </section>

          {/* Scoring System */}
          <section className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-100">
                <CheckCircle className="h-4 w-4 mr-1" />
                Scoring System
              </Badge>
            </h4>

            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li><strong>Base Score:</strong> 1,000 points for completing the puzzle</li>
              <li><strong>Time Bonus:</strong> Up to 500 points (decreases by 50 per minute)</li>
              <li><strong>Hint Penalty:</strong> -100 points per hint used</li>
              <li><strong>Efficiency Bonus:</strong> Penalty for excessive moves (over 50)</li>
              <li><strong>Minimum Score:</strong> 100 points guaranteed for completion</li>
            </ul>
          </section>

          {/* Strategy Tips */}
          <section className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-100">
                <Target className="h-4 w-4 mr-1" />
                Strategy Tips
              </Badge>
            </h4>

            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li>Start with cells that have the fewest possible options</li>
              <li>Look for rows, columns, or boxes that are nearly complete</li>
              <li>Use the process of elimination to narrow down possibilities</li>
              <li>Check for conflicts immediately after placing numbers</li>
              <li>Work systematically rather than randomly filling cells</li>
            </ul>
          </section>

          {/* Validation */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-indigo-600" />
              <h4 className="font-semibold text-indigo-700">Puzzle Validation</h4>
            </div>
            <p className="text-sm text-indigo-600">
              The puzzle will automatically check for conflicts and highlight them in red. You can only 
              submit when all cells are filled and there are no conflicts. The system will verify your 
              solution against the correct answer before awarding points.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-3">
            <Button 
              variant="outline"
              onClick={onClose}
              className="border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Close Rules
            </Button>
            
            <Button 
              ref={closeBtnRef}
              onClick={onClose} 
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-8"
            >
              <Grid3X3 className="h-4 w-4 mr-2" />
              Start Sudoku Challenge
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
