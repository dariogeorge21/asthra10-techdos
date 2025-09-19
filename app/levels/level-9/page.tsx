/**
 * LEVEL-9 KEYBOARD TREASURE HUNT IMPLEMENTATION - TECHDOS GAME
 *
 * OVERVIEW:
 * Level-9 represents a keyboard treasure hunt challenge in the TechDOS quiz game, featuring
 * riddles about keyboard shortcuts that players need to solve by selecting the correct
 * shortcut from a dropdown menu with 35-40 options.
 *
 * PUZZLE MECHANICS:
 * - Format: Riddle-based questions about keyboard shortcuts
 * - Total Questions: 10 diverse keyboard shortcut riddles
 * - Input Method: Dropdown menu with 35-40 keyboard shortcut options
 * - Answer Validation: Exact match with correct shortcut
 * - Hint System: Players can use hints similar to level-22
 * - Timer Integration: Real-time countdown with global game timer
 * - Navigation Protection: Prevents accidental page refresh/navigation during quiz
 *
 * GAME FLOW:
 * 1. Riddle Display: Keyboard shortcut riddles are presented sequentially
 * 2. Answer Selection: Players select correct shortcut from dropdown menu
 * 3. Answer Validation: Selection is validated against correct answer
 * 4. Answer Submission: Submit selected answer or skip to next question
 * 5. Progress Tracking: Visual progress bar and question counter
 * 6. Level Completion: Automatic progression after all questions answered/skipped
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Timer, HelpCircle, SkipForward, ArrowRight, CheckCircle, Target, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Team, getGameTimeRemaining, formatTimeRemaining, getGameTimerStatus } from "@/lib/supabase";

interface KeyboardQuestion {
  id: number;
  riddle: string;
  correctAnswer: string;
  hint: string;
}

/**
 * LEVEL-9 KEYBOARD TREASURE HUNT QUESTIONS
 * 10 riddles about keyboard shortcuts with hints
 */
const questions: KeyboardQuestion[] = [
  {
    id: 1,
    riddle: "I can undo your biggest mistake… but if you press me too many times, I'll also undo your success. Who am I?",
    correctAnswer: "Ctrl + Z",
    hint: "This shortcut reverses the last action you performed in most applications."
  },
  {
    id: 2,
    riddle: "You closed me in anger, but now regret it. Which shortcut brings me back from the dead?",
    correctAnswer: "Ctrl + Shift + T",
    hint: "This shortcut reopens the most recently closed tab in your browser."
  },
  {
    id: 3,
    riddle: "Your boss is behind you. Hide everything instantly!",
    correctAnswer: "Win + D",
    hint: "This Windows shortcut minimizes all windows and shows the desktop immediately."
  },
  {
    id: 4,
    riddle: "I can copy myself infinitely. Shortcut to duplicate me?",
    correctAnswer: "Ctrl + D",
    hint: "This shortcut duplicates the current tab in most browsers or duplicates objects in design software."
  },
  {
    id: 5,
    riddle: "You want to look smarter instantly. Shortcut to zoom in? ",
    correctAnswer: "Ctrl + +",
    hint: "This shortcut increases the zoom level in most applications."
  },
  {
    id: 6,
    riddle: "I make words louder, thicker, stronger… Press me.",
    correctAnswer: "Ctrl + B",
    hint: "This shortcut makes selected text bold in most text editors and word processors."
  },
  {
    id: 7,
    riddle: "I don't leave anyone behind. One press, and I take everyone with me.",
    correctAnswer: "Ctrl + A",
    hint: "This shortcut selects all content in the current document or window."
  },
  {
    id: 8,
    riddle: "Final level! Open the secret world where nothing is saved in history.",
    correctAnswer: "Ctrl + Shift + N",
    hint: "This shortcut opens a new incognito/private browsing window in most browsers."
  },
  {
    id: 9,
    riddle: "I'm a magician. I instantly move you from one window to another — left, right, left, right… Which shortcut am I?",
    correctAnswer: "Alt + Tab",
    hint: "This shortcut switches between open applications or windows on your computer."
  },
  {
    id: 10,
    riddle: "I let you preview all your open windows at once — like a spy with many eyes. What's my move?",
    correctAnswer: "Win + Tab",
    hint: "This Windows shortcut shows Task View with all your open windows and virtual desktops."
  }
];

/**
 * KEYBOARD SHORTCUT OPTIONS FOR DROPDOWN
 * 40 keyboard shortcuts including correct answers and distractors
 */
const keyboardShortcuts = [
  "Ctrl + Z", "Ctrl + Y", "Ctrl + X", "Ctrl + C", "Ctrl + V",
  "Ctrl + A", "Ctrl + S", "Ctrl + F", "Ctrl + G", "Ctrl + H",
  "Ctrl + N", "Ctrl + O", "Ctrl + P", "Ctrl + Q", "Ctrl + R",
  "Ctrl + T", "Ctrl + U", "Ctrl + W", "Ctrl + D", "Ctrl + B",
  "Ctrl + I", "Ctrl + K", "Ctrl + L", "Ctrl + +", "Ctrl + -",
  "Ctrl + 0", "Ctrl + 1", "Ctrl + 2", "Ctrl + 3", "Ctrl + 4",
  "Ctrl + Shift + T", "Ctrl + Shift + N", "Ctrl + Shift + W", "Ctrl + Shift + Tab",
  "Alt + Tab", "Alt + F4", "Alt + Enter", "Win + D", "Win + Tab", "Win + L",
  "F5", "F11", "Esc", "Tab", "Shift + Tab", "Enter", "Space", "Backspace", "Delete"
];

export default function Level9Page() {
  const [team, setTeam] = useState<Team | null>(null);
  const [initialTeamStats, setInitialTeamStats] = useState<{
    correct_questions: number;
    incorrect_questions: number;
    skipped_questions: number;
    hint_count: number;
  } | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showHint, setShowHint] = useState(false);
  const [levelStartTime] = useState<Date>(new Date());
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [timerStatus, setTimerStatus] = useState<'not_started' | 'active' | 'expired'>('not_started');
  const [loading, setLoading] = useState(true);
  const [skipLoading, setSkipLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [flashState, setFlashState] = useState<'correct' | 'incorrect' | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionTimeMinutes, setCompletionTimeMinutes] = useState<number>(0);
  const [completionScoreData, setCompletionScoreData] = useState<{
    totalScore: number;
    baseScore: number;
    timeBonus: number;
    consecutiveBonus: number;
    penalties: number;
    timeTaken: number;
    accuracy: number;
    performanceRating: string;
  } | null>(null);
  const [levelStats, setLevelStats] = useState({
    correct: 0,
    incorrect: 0,
    skipped: 0,
    hintsUsed: 0
  });
  const router = useRouter();

  const fetchTeamData = useCallback(async (teamCode: string) => {
    try {
      const response = await fetch(`/api/teams/${teamCode}`);
      if (!response.ok) {
        throw new Error('Failed to fetch team data');
      }
      const teamData = await response.json();
      setTeam(teamData);

      setInitialTeamStats({
        correct_questions: teamData.correct_questions,
        incorrect_questions: teamData.incorrect_questions,
        skipped_questions: teamData.skipped_questions,
        hint_count: teamData.hint_count
      });

      if (teamData.current_level > 9) {
        toast.info("You've already completed this level!");
        router.push('/levels');
        return;
      }

      const status = getGameTimerStatus(teamData);
      setTimerStatus(status);
      setTimeRemaining(getGameTimeRemaining(teamData));
    } catch (error) {
      console.error('Error fetching team data:', error);
      toast.error("Failed to load team data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const teamCode = localStorage.getItem('team_code');
    if (!teamCode) {
      toast.error("No team code found. Please start from the home page.");
      router.push('/');
      return;
    }

    fetchTeamData(teamCode);

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      return (e.returnValue = '');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [router, fetchTeamData]);

  useEffect(() => {
    if (team) {
      const timer = setInterval(() => {
        const remaining = getGameTimeRemaining(team);
        const status = getGameTimerStatus(team);

        setTimeRemaining(remaining);
        setTimerStatus(status);

        if (status === 'expired' && timerStatus !== 'expired') {
          toast.error("Time's up! The game has ended.");
          router.push('/levels');
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [team, timerStatus, router]);

  // Add useEffect to reset flash state after animation
  useEffect(() => {
    if (flashState) {
      const timer = setTimeout(() => {
        setFlashState(null);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [flashState]);

  const getTimerDisplay = (): { text: string; className: string } => {
    switch (timerStatus) {
      case 'not_started':
        return { text: 'Game Not Started', className: 'text-gray-500' };
      case 'expired':
        return { text: '00:00:00', className: 'text-red-600' };
      case 'active':
        return { text: formatTimeRemaining(timeRemaining), className: 'text-red-600' };
      default:
        return { text: 'Game Not Started', className: 'text-gray-500' };
    }
  };

  const updateTeamStats = async (stats: Record<string, number>) => {
    const teamCode = localStorage.getItem('team_code');
    if (!teamCode) return;

    try {
      await fetch(`/api/teams/${teamCode}/stats`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stats)
      });
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  };

  const handleAnswer = async () => {
    if (submitLoading || !selectedAnswer) {
      return;
    }

    setSubmitLoading(true);

    try {
      // Fallback: if level is completed but score data is not yet available
  if (isCompleted && !completionScoreData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Calculating final score...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
      const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

      // Trigger flash effect for visual feedback
      setFlashState(isCorrect ? 'correct' : 'incorrect');

      const newStats = { ...levelStats };
      if (isCorrect) {
        newStats.correct++;
      } else {
        newStats.incorrect++;
      }
      setLevelStats(newStats);

      if (!team) return;
      
      const updatedStats = {
        correct_questions: team.correct_questions + (isCorrect ? 1 : 0),
        incorrect_questions: team.incorrect_questions + (isCorrect ? 0 : 1),
        hint_count: team.hint_count + (showHint ? 1 : 0)
      };

      await updateTeamStats(updatedStats);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer("");
        setShowHint(false);
      } else {
        completeLevel();
      }
    } catch (err) {
      console.error("API request for submit answer failed", err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSkip = async () => {
    if (skipLoading) {
      return;
    }

    setSkipLoading(true);

    try {
      const newStats = { ...levelStats };
      newStats.skipped++;
      setLevelStats(newStats);

      if (!team) return;

      const updatedStats = {
        skipped_questions: team.skipped_questions + 1,
        hint_count: team.hint_count + (showHint ? 1 : 0)
      };

      await updateTeamStats(updatedStats);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer("");
        setShowHint(false);
      } else {
        completeLevel();
      }
    } catch (err) {
      console.error("API request for skip question failed", err);
    } finally {
      setSkipLoading(false);
    }
  };

  const handleHint = () => {
    setShowHint(true);
    const newStats = { ...levelStats };
    newStats.hintsUsed++;
    setLevelStats(newStats);
  };

  const calculateScore = (completionTime?: number): {
    totalScore: number;
    baseScore: number;
    timeBonus: number;
    consecutiveBonus: number;
    penalties: number;
    timeTaken: number;
    accuracy: number;
    performanceRating: string;
  } => {
    const timeTaken = completionTime !== undefined ? 
      completionTime : 
      (new Date().getTime() - levelStartTime.getTime()) / 1000 / 60;
    const totalQuestions = levelStats.correct + levelStats.incorrect + levelStats.skipped;
    const accuracy = totalQuestions > 0 ? (levelStats.correct / totalQuestions) * 100 : 0;

    const correctWithoutHints = Math.max(0, levelStats.correct - levelStats.hintsUsed);
    const correctWithHints = Math.min(levelStats.correct, levelStats.hintsUsed);

    let baseScore = 0;
    baseScore += correctWithoutHints * 1500;
    baseScore += correctWithHints * 1000;

    const penalties = (levelStats.incorrect * 400) + (levelStats.skipped * 750);
    const consecutiveBonus = Math.floor(levelStats.correct / 3) * 200;

    let timeBonus = 0;
    if (timeTaken < 1) timeBonus = 250;
    else if (timeTaken < 1.5) timeBonus = 225;
    else if (timeTaken < 2) timeBonus = 200;
    else if (timeTaken < 2.5) timeBonus = 175;
    else if (timeTaken < 3) timeBonus = 150;
    else if (timeTaken < 3.5) timeBonus = 125;
    else if (timeTaken < 4) timeBonus = 100;
    else if (timeTaken < 4.5) timeBonus = 75;
    else if (timeTaken < 5) timeBonus = 50;
    else if (timeTaken < 5.5) timeBonus = 25;

    let performanceRating = "Needs Improvement";
    if (accuracy >= 90) {
      if (timeTaken < 3) performanceRating = "Excellent";
      else if (timeTaken < 5) performanceRating = "Good";
      else performanceRating = "Average";
    } else if (accuracy >= 70) {
      if (timeTaken < 4) performanceRating = "Good";
      else performanceRating = "Average";
    } else if (accuracy >= 50 && timeTaken < 5) {
      performanceRating = "Average";
    }

    const totalScore = Math.max(0, baseScore + consecutiveBonus + timeBonus - penalties);

    return {
      totalScore,
      baseScore,
      timeBonus,
      consecutiveBonus,
      penalties,
      timeTaken,
      accuracy,
      performanceRating
    };
  };

  const completeLevel = async () => {
    if (!team) return;

    const teamCode = localStorage.getItem('team_code');
    if (!teamCode) return;

    const timeTaken = (new Date().getTime() - levelStartTime.getTime()) / 1000 / 60;
    setCompletionTimeMinutes(timeTaken);

    const scoreData = calculateScore(timeTaken);
    // Store the calculated score data for consistent display
    setCompletionScoreData(scoreData);
    const newTotalScore = team.score + scoreData.totalScore;
    const newLevel = 10;

    try {
      if (initialTeamStats) {
        const finalStats = {
          correct_questions: initialTeamStats.correct_questions + levelStats.correct,
          incorrect_questions: initialTeamStats.incorrect_questions + levelStats.incorrect,
          skipped_questions: initialTeamStats.skipped_questions + levelStats.skipped,
          hint_count: initialTeamStats.hint_count + levelStats.hintsUsed
        };

        await fetch(`/api/teams/${teamCode}/stats`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalStats)
        });
      }

      await fetch(`/api/teams/${teamCode}/score`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: newTotalScore,
          current_level: newLevel
        })
      });

      setIsCompleted(true);
    } catch (error) {
      console.error('Error completing level:', error);
      toast.error("Failed to save progress. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading Level 9...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Failed to load team data.</p>
          <Button onClick={() => router.push('/')} className="mt-4">
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  if (isCompleted && completionScoreData) {
    // Use the stored score data that was calculated during level completion
    // This ensures the displayed score exactly matches what was sent to the API
    const scoreData = completionScoreData;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-700">Level 9 Complete! 🎉</CardTitle>
            <div className="mt-2">
              <Badge variant="outline" className={`text-lg px-4 py-2 ${
                scoreData.performanceRating === 'Excellent' ? 'bg-green-50 text-green-700 border-green-200' :
                scoreData.performanceRating === 'Good' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                scoreData.performanceRating === 'Average' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                'bg-red-50 text-red-700 border-red-200'
              }`}>
                Performance: {scoreData.performanceRating}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{levelStats.correct}</div>
                <div className="text-sm text-green-700">Correct</div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{levelStats.incorrect}</div>
                <div className="text-sm text-red-700">Incorrect</div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{levelStats.skipped}</div>
                <div className="text-sm text-yellow-700">Skipped</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{levelStats.hintsUsed}</div>
                <div className="text-sm text-blue-700">Hints Used</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Timer className="h-5 w-5 text-purple-600 mr-2" />
                  <span className="text-lg font-semibold text-purple-700">Time Taken</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.floor(completionTimeMinutes)}:{String(Math.floor((completionTimeMinutes % 1) * 60)).padStart(2, '0')}
                </div>
                <div className="text-sm text-purple-600">minutes</div>
              </div>
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-5 w-5 text-indigo-600 mr-2" />
                  <span className="text-lg font-semibold text-indigo-700">Accuracy</span>
                </div>
                <div className="text-2xl font-bold text-indigo-600">
                  {scoreData.accuracy.toFixed(1)}%
                </div>
                <div className="text-sm text-indigo-600">correct answers</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-center text-purple-700 mb-4">Score Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Base Score (Correct Answers)</span>
                  <span className="font-semibold text-green-600">+{scoreData.baseScore.toLocaleString()}</span>
                </div>
                {scoreData.consecutiveBonus > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Consecutive Correct Bonus</span>
                    <span className="font-semibold text-blue-600">+{scoreData.consecutiveBonus.toLocaleString()}</span>
                  </div>
                )}
                {scoreData.timeBonus > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Speed Bonus</span>
                    <span className="font-semibold text-yellow-600">+{scoreData.timeBonus.toLocaleString()}</span>
                  </div>
                )}
                {scoreData.penalties > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Penalties (Wrong/Skipped)</span>
                    <span className="font-semibold text-red-600">-{scoreData.penalties.toLocaleString()}</span>
                  </div>
                )}
                <hr className="border-gray-300" />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-purple-700">Total Level Score</span>
                  <span className="text-purple-700">+{scoreData.totalScore.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => router.push('/levels')}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg py-3"
            >
              Continue to Next Level
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Create a Flash Effect Component
  const FlashEffect = () => {
    if (!flashState) return null;

    return (
      <div
        className={`fixed inset-0 z-50 pointer-events-none animate-flash ${
          flashState === 'correct'
            ? 'bg-green-500/30'
            : 'bg-red-500/30'
        }`}
      />
    );
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const timerDisplay = getTimerDisplay();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4">
      <FlashEffect />
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Keyboard className="h-6 w-6 text-purple-600" />
                <h1 className="text-2xl font-bold text-purple-800">Level 9 - Keyboard Treasure Hunt</h1>
              </div>
              <Badge variant="outline" className="text-purple-700 border-purple-300">
                {currentQuestionIndex + 1} of {questions.length}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Timer className="h-5 w-5 text-red-600" />
              <span className={`font-mono text-lg font-semibold ${timerDisplay.className}`}>
                {timerDisplay.text}
              </span>
            </div>
          </div>
          
          <Progress value={progress} className="h-2 bg-purple-100" />
          <p className="text-sm text-gray-600 mt-2">
            Progress: {currentQuestionIndex + 1}/{questions.length} questions completed
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">
              <div className="text-2xl font-bold text-purple-700 mb-4">
                {currentQuestion.riddle}
              </div>
              <div className="text-lg text-gray-600">
                Select the correct keyboard shortcut from the dropdown below
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Choose your answer:</label>
              <Select value={selectedAnswer} onValueChange={setSelectedAnswer}>
                <SelectTrigger className="w-full text-lg p-4">
                  <SelectValue placeholder="Select a keyboard shortcut..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {keyboardShortcuts.map((shortcut, index) => (
                    <SelectItem key={index} value={shortcut} className="text-lg p-2">
                      {shortcut}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Tip: Look for the keyboard shortcut that best matches the riddle description.
              </p>
            </div>

            {showHint && (
              <Alert className="bg-blue-50 border-blue-200">
                <HelpCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  <strong>Hint:</strong> {currentQuestion.hint}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleHint}
                disabled={showHint}
                className="flex-1"
              >
                <HelpCircle className="mr-2 h-4 w-4" />
                {showHint ? "Hint Shown" : "Show Hint"}
              </Button>
              
              <Button
                onClick={handleSkip}
                disabled={skipLoading}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                {skipLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                ) : (
                  <SkipForward className="mr-2 h-4 w-4" />
                )}
                Skip
              </Button>
              
              <Button
                onClick={handleAnswer}
                disabled={!selectedAnswer || submitLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {submitLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Submit Answer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
