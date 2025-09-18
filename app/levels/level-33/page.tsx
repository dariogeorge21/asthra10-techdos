/**
 * LEVEL-33 QUIZ IMPLEMENTATION - TECHDOS GAME
 *
 * OVERVIEW:
 * Level-33 represents the "Digital Lockdown" logic challenge featuring a comprehensive
 * multiple-choice question (MCQ) format designed to test logical reasoning, mathematical
 * thinking, wordplay, and problem-solving skills in a digital/tech-themed context.
 *
 * QUIZ MECHANICS:
 * - Format: Multiple Choice Questions (MCQ) with 4 options each
 * - Total Questions: 5 challenging logic-based questions
 * - Hint System: Each question includes a helpful hint that can be revealed
 * - Timer Integration: Real-time countdown with global game timer
 * - Navigation Protection: Prevents accidental page refresh/navigation during quiz
 * - Loading States: All interactive buttons show loading states during operations
 *
 * GAME FLOW:
 * 1. Question Selection: Questions are presented sequentially
 * 2. Answer Selection: Players choose from 4 multiple-choice options (A, B, C, D)
 * 3. Hint Usage: Optional hints available for each question (affects scoring)
 * 4. Answer Submission: Submit selected answer or skip to next question
 * 5. Progress Tracking: Visual progress bar and question counter
 * 6. Level Completion: Automatic progression after all questions answered/skipped
 *
 * STATISTICS TRACKING:
 * - Correct Answers: Number of questions answered correctly
 * - Incorrect Answers: Number of questions answered incorrectly
 * - Skipped Questions: Number of questions skipped without answering
 * - Hints Used: Total number of hints revealed during the level
 * - Time Taken: Duration from level start to completion
 * - Consecutive Correct: Tracks streaks for bonus calculations
 *
 * SCORING ALGORITHM:
 * Base Points:
 * - Correct Answer (no hint): 1600 points (higher for logic challenges)
 * - Correct Answer (with hint): 1100 points
 * - Incorrect Answer: -450 points penalty
 * - Skipped Question: -800 points penalty
 *
 * Bonus Systems:
 * - Consecutive Correct Bonus: +250 points for every 3 consecutive correct answers
 * - Time Bonus (based on completion speed):
 *   * Under 2 min: +300 points
 *   * 2-3 min: +275 points
 *   * 3-4 min: +250 points
 *   * 4-5 min: +225 points
 *   * 5-6 min: +200 points
 *   * 6-7 min: +175 points
 *   * 7-8 min: +150 points
 *   * 8-9 min: +125 points
 *   * 9-10 min: +100 points
 *   * Over 10 min: No time bonus
 *
 * FINAL SCORE CALCULATION:
 * Total Score = (Base Points) + (Consecutive Bonus) + (Time Bonus)
 * Minimum Score: 0 (negative scores are clamped to zero)
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Timer, HelpCircle, SkipForward, ArrowRight, CheckCircle, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Team, getGameTimeRemaining, formatTimeRemaining, getGameTimerStatus } from "@/lib/supabase";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: string;
  hint: string;
}

/**
 * LEVEL-33 QUESTION BANK - DIGITAL LOCKDOWN LOGIC CHALLENGE
 *
 * A collection of 5 logic-based multiple-choice questions covering:
 * - Mathematical riddles and number puzzles
 * - Wordplay and pattern recognition
 * - Logic puzzles and deductive reasoning
 * - Abstract thinking and problem solving
 * - Quick mathematical calculations
 *
 * Each question includes:
 * - 4 carefully crafted options with plausible distractors
 * - One correct answer
 * - A helpful hint that provides context without giving away the answer
 */
const questions: Question[] = [
  {
    id: 1,
    question: "I am a two-digit number. My digits add up to 9. If you reverse me, I'm 27 greater than before. What number am I?",
    options: ["36", "45", "54", "63"],
    correct: "36",
    hint: "Think about two-digit numbers where the digits sum to 9, then check which one becomes 27 larger when reversed. Try 36 → 63."
  },
  {
    id: 2,
    question: "Take the word 'PROGRAM'. How many letters are symmetrical along a vertical line (like A, H, I, M, O)?",
    options: ["2", "3", "4", "5"],
    correct: "3",
    hint: "Look at each letter in PROGRAM and imagine folding it along a vertical line. Which letters look the same on both sides?"
  },
  {
    id: 3,
    question: "Three switches (A, B, C) control a lightbulb in another room. Only one switch works. You can enter the room once. Using the method: turn on A for 1 min then off, turn on B, then enter. How many possibilities are there for which switch works?",
    options: ["2", "3", "4", "6"],
    correct: "3",
    hint: "Consider what you can observe: the bulb can be on, off but warm, or off and cool. Each state tells you which switch works."
  },
  {
    id: 4,
    question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
    options: ["Echo", "Shadow", "Reflection", "Sound"],
    correct: "Echo",
    hint: "Think about something that can 'speak' back to you, has no physical form, but becomes more noticeable in certain environments."
  },
  {
    id: 5,
    question: "(7 × 8) – (9 + 5) = ?",
    options: ["42", "44", "46", "48"],
    correct: "42",
    hint: "Follow the order of operations: first calculate the multiplication and addition in parentheses, then subtract."
  }
];

export default function Level33Page() {
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
  const [hintLoading, setHintLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionTimeMinutes, setCompletionTimeMinutes] = useState<number>(0);
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

      // Store initial team statistics to track level-specific changes
      setInitialTeamStats({
        correct_questions: teamData.correct_questions,
        incorrect_questions: teamData.incorrect_questions,
        skipped_questions: teamData.skipped_questions,
        hint_count: teamData.hint_count
      });

      if (teamData.current_level > 33) {
        toast.info("You've already completed this level!");
        router.push('/levels');
        return;
      }

      // Initialize timer status
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

    // Prevent page reload/navigation
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
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [team, timerStatus]);

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

  const handleAnswer = async (answer: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correct;

    if (submitLoading) {
      return;
    }

    setSubmitLoading(true);

    try {
      const newStats = { ...levelStats };
      if (isCorrect) {
        newStats.correct++;
      } else {
        newStats.incorrect++;
      }
      setLevelStats(newStats);

      // Update team stats in database
      if (!team) return;

      const updatedStats = {
        correct_questions: team.correct_questions + (isCorrect ? 1 : 0),
        incorrect_questions: team.incorrect_questions + (isCorrect ? 0 : 1),
        hint_count: team.hint_count + (showHint ? 1 : 0)
      };

      await updateTeamStats(updatedStats);

      // Move to next question or complete level
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

  const handleHint = async () => {
    if (hintLoading || showHint) {
      return;
    }

    setHintLoading(true);

    try {
      setShowHint(true);
      const newStats = { ...levelStats };
      newStats.hintsUsed++;
      setLevelStats(newStats);
    } catch (err) {
      console.error("Error showing hint", err);
    } finally {
      setHintLoading(false);
    }
  };

  /**
   * ENHANCED SCORING ALGORITHM FOR LEVEL-33 - DIGITAL LOCKDOWN
   *
   * Logic challenge scoring with emphasis on reasoning and problem-solving skills
   */
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
      (new Date().getTime() - levelStartTime.getTime()) / 1000 / 60; // minutes
    const totalQuestions = levelStats.correct + levelStats.incorrect + levelStats.skipped;
    const accuracy = totalQuestions > 0 ? (levelStats.correct / totalQuestions) * 100 : 0;

    // Base scoring calculation - higher points for logic challenges
    const correctWithoutHints = Math.max(0, levelStats.correct - levelStats.hintsUsed);
    const correctWithHints = Math.min(levelStats.correct, levelStats.hintsUsed);

    let baseScore = 0;
    baseScore += correctWithoutHints * 1600; // Higher points for unassisted correct answers
    baseScore += correctWithHints * 1100;    // Reduced points for hint-assisted answers

    // Penalties
    const penalties = (levelStats.incorrect * 450) + (levelStats.skipped * 800);

    // Consecutive correct bonus
    const consecutiveBonus = Math.floor(levelStats.correct / 3) * 250;

    // Time bonus calculation - adjusted for logic challenges
    let timeBonus = 0;
    if (timeTaken < 2) timeBonus = 300;
    else if (timeTaken < 3) timeBonus = 275;
    else if (timeTaken < 4) timeBonus = 250;
    else if (timeTaken < 5) timeBonus = 225;
    else if (timeTaken < 6) timeBonus = 200;
    else if (timeTaken < 7) timeBonus = 175;
    else if (timeTaken < 8) timeBonus = 150;
    else if (timeTaken < 9) timeBonus = 125;
    else if (timeTaken < 10) timeBonus = 100;

    // Performance rating
    let performanceRating = "Needs Improvement";
    if (accuracy >= 90 && timeTaken < 4) performanceRating = "Excellent";
    else if (accuracy >= 80 && timeTaken < 6) performanceRating = "Good";
    else if (accuracy >= 60 && timeTaken < 8) performanceRating = "Average";

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
    const newTotalScore = team.score + scoreData.totalScore;
    const newLevel = 34;

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
          <p className="text-lg text-gray-600">Loading Level 33...</p>
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

  if (isCompleted) {
    const scoreData = calculateScore(completionTimeMinutes);

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-700">Level 33 Complete!</CardTitle>
            <div className="mt-2">
              <Badge variant="outline" className="text-lg px-4 py-2 bg-purple-50 text-purple-700 border-purple-200">
                Digital Lockdown Challenge
              </Badge>
            </div>
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
            {/* Performance Statistics */}
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

            {/* Time and Accuracy */}
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
                <div className="text-sm text-indigo-600">logic challenges</div>
              </div>
            </div>

            {/* Detailed Score Breakdown */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-center text-purple-700 mb-4">Score Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Base Score (Logic Challenges)</span>
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

            {/* Performance Feedback */}
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">Performance Feedback</h4>
              <p className="text-sm text-gray-600">
                {scoreData.performanceRating === 'Excellent' &&
                  "Outstanding logical reasoning! You demonstrated excellent problem-solving skills and quick thinking. Keep up the great work!"}
                {scoreData.performanceRating === 'Good' &&
                  "Great logical thinking! You showed solid reasoning abilities with good accuracy and timing. Well done!"}
                {scoreData.performanceRating === 'Average' &&
                  "Good effort! Your logical reasoning is developing. Consider practicing more logic puzzles and mathematical problems."}
                {scoreData.performanceRating === 'Needs Improvement' &&
                  "Keep practicing your logical reasoning! Focus on breaking down problems step by step and try different approaches."}
              </p>
            </div>

            <Button
              onClick={() => router.push('/levels')}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg py-3"
            >
              Continue to Level 34
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-purple-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Level 33 - Digital Lockdown
              </Badge>
              <span className="text-lg font-semibold text-gray-800">{team.team_name}</span>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <span className="text-lg font-semibold text-gray-800">
                  {team.score.toLocaleString()} pts
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Timer className={`h-5 w-5 ${timerStatus === 'not_started' ? 'text-gray-500' : 'text-red-600'}`} />
                <span className={`text-lg font-mono font-semibold ${getTimerDisplay().className}`}>
                  {getTimerDisplay().text}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-gray-800">
                {currentQuestion.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Options */}
              <div className="grid gap-3">
                {currentQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedAnswer === option ? "default" : "outline"}
                    className={`p-4 h-auto text-left justify-start ${
                      selectedAnswer === option
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "hover:bg-purple-50"
                    }`}
                    onClick={() => setSelectedAnswer(option)}
                  >
                    <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </Button>
                ))}
              </div>

              {/* Hint */}
              {showHint && (
                <Alert className="bg-blue-50 border-blue-200">
                  <HelpCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700">
                    <strong>Hint:</strong> {currentQuestion.hint}
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleHint}
                  disabled={showHint || hintLoading}
                  className="flex-1"
                >
                  {hintLoading ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-gray-600 border-t-transparent" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <HelpCircle className="mr-2 h-4 w-4" />
                      {showHint ? "Hint Shown" : "Show Hint"}
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleSkip}
                  disabled={skipLoading}
                  className="flex-1 text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                >
                  {skipLoading ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-yellow-600 border-t-transparent" />
                      Skipping...
                    </>
                  ) : (
                    <>
                      <SkipForward className="mr-2 h-4 w-4" />
                      Skip Question
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => handleAnswer(selectedAnswer)}
                  disabled={!selectedAnswer || submitLoading}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {submitLoading ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Answer
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
