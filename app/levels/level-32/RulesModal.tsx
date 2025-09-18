"use client";

import { useEffect, useRef } from "react";
import { Play, Eye, Target, CheckCircle } from "lucide-react";
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
              <Play className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <CardTitle id="level-rules-title" className="text-xl font-bold">
                Level 32 - Video Challenge Rules
              </CardTitle>
              <div className="text-sm text-gray-600">Video-based observation challenge</div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-6 space-y-6">
          {/* Main Description */}
          <div className="text-gray-600 space-y-4">
            <p className="text-lg font-medium text-purple-700">
              This is a video type game. You will be shown an audioless video and based on that video you will be asked questions. Please observe all the details in the video carefully.
            </p>
          </div>

          {/* How it Works */}
          <section className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                <Eye className="h-4 w-4 mr-1" />
                How It Works
              </Badge>
            </h4>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
              <li>You&apos;ll watch a silent video (no audio)</li>
              <li>The video can only be watched once per game session</li>
              <li>Pay close attention to all visual details</li>
              <li>After the video ends, you&apos;ll answer questions about what you observed</li>
              <li>Questions will test your observation skills and attention to detail</li>
            </ul>
          </section>

          {/* Video Controls */}
          <section className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-100">
                <Play className="h-4 w-4 mr-1" />
                Video Controls
              </Badge>
            </h4>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
              <li>You can play/pause the video during playback</li>
              <li>Seeking (jumping to different parts) is disabled</li>
              <li>Once the video completes, it cannot be replayed</li>
              <li>The video is silent - focus on visual elements only</li>
            </ul>
          </section>

          {/* Scoring Rules */}
          <section className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100">
                <CheckCircle className="h-4 w-4 mr-1" />
                Scoring Rules
              </Badge>
            </h4>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
              <li>Higher points for correct answers (observation skills bonus)</li>
              <li>No hints available for this level</li>
              <li>Wrong answers and skips result in point deductions</li>
              <li>Speed bonus for quick completion after video ends</li>
              <li>Consecutive correct answers earn bonus points</li>
            </ul>
          </section>

          {/* Pro Tip */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-700 flex items-center gap-2 mb-2">
              <Target className="h-4 w-4" />
              Pro Tip
            </h4>
            <p className="text-blue-600 text-sm">
              Watch carefully for small details like text, numbers, names, objects, and people. 
              The questions will test your ability to notice and remember specific elements from the video.
            </p>
          </div>

          <div className="flex justify-end pt-3">
            <Button 
              ref={closeBtnRef}
              onClick={onClose}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Got it! Watch Video
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
