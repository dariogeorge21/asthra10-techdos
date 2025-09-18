"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Timer, Eye, CheckCircle, Target, Lightbulb, Keyboard as KeyboardIcon, SkipForward, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Team, getGameTimeRemaining, formatTimeRemaining, getGameTimerStatus } from "@/lib/supabase";
import { Keyboard } from "./keyboard";

interface Question {
  id: number;
  logoImage: string;
  correctAnswer: string;
  acceptedAnswers: string[];
  hint: string;
}

/**
 * LEVEL-21 BRAND LOGO RECOGNITION QUESTIONS
 * 
 * A collection of 10 brand logo recognition challenges featuring:
 * - Popular global brands across different industries
 * - High-quality logo images for clear recognition
 * - Multiple accepted answer variations for flexibility
 * - Helpful hints that guide without giving away answers
 */
const questions: Question[] = [
  {
    id: 1,
    logoImage: "/levels/level-21/yahoo.png",
    correctAnswer: "Yahoo",
    acceptedAnswers: ["yahoo", "yahoo!", "yahoo inc"],
    hint: "Popular search engine and web portal from the 1990s"
  },
  {
    id: 2,
    logoImage: "/levels/level-21/rolex.png",
    correctAnswer: "Rolex",
    acceptedAnswers: ["rolex", "rolex sa"],
    hint: "Luxury Swiss watch manufacturer known for precision timepieces"
  },
  {
    id: 3,
    logoImage: "/levels/level-21/microsoft.png",
    correctAnswer: "Microsoft",
    acceptedAnswers: ["microsoft", "microsoft corporation", "ms"],
    hint: "Technology giant that created Windows operating system"
  },
  {
    id: 4,
    logoImage: "/levels/level-21/burger-king.png",
    correctAnswer: "Burger King",
    acceptedAnswers: ["burger king", "bk", "burger king corporation"],
    hint: "Fast food chain famous for flame-grilled burgers"
  },
  {
    id: 5,
    logoImage: "/levels/level-21/xbox.png",
    correctAnswer: "Xbox",
    acceptedAnswers: ["xbox", "xbox game studios", "microsoft xbox"],
    hint: "Gaming console brand by Microsoft"
  },
  {
    id: 6,
    logoImage: "/levels/level-21/sprite.png",
    correctAnswer: "Sprite",
    acceptedAnswers: ["sprite", "sprite soda"],
    hint: "Lemon-lime flavored soft drink by Coca-Cola"
  },
  {
    id: 7,
    logoImage: "/levels/level-21/puma.png",
    correctAnswer: "Puma",
    acceptedAnswers: ["puma", "puma se"],
    hint: "German sportswear brand with a leaping cat logo"
  },
  {
    id: 8,
    logoImage: "/levels/level-21/reddit.png",
    correctAnswer: "Reddit",
    acceptedAnswers: ["reddit", "reddit inc"],
    hint: "Social news aggregation and discussion website"
  },
  {
    id: 9,
    logoImage: "/levels/level-21/under-armour.png",
    correctAnswer: "Under Armour",
    acceptedAnswers: ["under armour", "under armor", "ua", "underarmour"],
    hint: "American sports equipment company known for athletic wear"
  },
  {
    id: 10,
    logoImage: "/levels/level-21/mastercard.png",
    correctAnswer: "Mastercard",
    acceptedAnswers: ["mastercard", "master card", "mastercard incorporated"],
    hint: "Global payment technology company with interlocking circles"
  }
];

// Virtual keyboard layout for brand name input
const keyboardLayout = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ['Space', 'Backspace']
];

export default function Level21Page() {
  const [team, setTeam] = useState<Team | null>(null);
  const [initialTeamStats, setInitialTeamStats] = useState<{
    correct_questions: number;
    incorrect_questions: number;
    skipped_questions: number;
    hint_count: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [isCompleted, setIsCompleted] = useState(false);
  const [usedButtons, setUsedButtons] = useState<{[key: number]: {hint: boolean, submit: boolean, skip: boolean}}>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [timerStatus, setTimerStatus] = useState<'not_started' | 'active' | 'expired'>('not_started');
  const [levelStartTime] = useState<Date>(new Date());
  const [skipLoading, setSkipLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [completionTimeMinutes, setCompletionTimeMinutes] = useState<number>(0);
  const [completionScoreData, setCompletionScoreData] = useState<{
    totalScore: number;
    baseScore: number;
    timeBonus: number;
    accuracyBonus: number;
    completionBonus: number;
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

  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const currentQuestion = questions[currentQuestionIndex];

  /**
   * ENHANCED SCORING ALGORITHM
   *
   * Calculates the final score for Level-21 based on multiple factors:
   *
   * BASE SCORING:
   * - Correct answers without hints: 100 points each
   * - Correct answers with hints: 75 points each (25 point penalty for hint usage)
   * - Accuracy Bonus: +200 points for 8+ correct answers, +100 for 6+ correct
   * - Completion Bonus: +300 points for completing all 10 questions
   *
   * PERFORMANCE RATING:
   * - Excellent: 80%+ accuracy, under 3 minutes
   * - Good: 60%+ accuracy, under 5 minutes
   * - Average: 40%+ accuracy, under 7 minutes
   * - Needs Improvement: Below 40% accuracy or over 7 minutes
   */
  const calculateScore = (completionTime?: number): {
    totalScore: number;
    baseScore: number;
    timeBonus: number;
    accuracyBonus: number;
    completionBonus: number;
    penalties: number;
    timeTaken: number;
    accuracy: number;
    performanceRating: string;
  } => {
    // Use provided completion time if available, otherwise calculate from current time
    const timeTaken = completionTime !== undefined ? 
      completionTime : 
      (new Date().getTime() - levelStartTime.getTime()) / 1000 / 60; // minutes
    
    const totalQuestions = questions.length;
    const accuracy = totalQuestions > 0 ? (levelStats.correct / totalQuestions) * 100 : 0;

    // Base scoring calculation
    const correctWithoutHints = Math.max(0, levelStats.correct - levelStats.hintsUsed);
    const correctWithHints = Math.min(levelStats.correct, levelStats.hintsUsed);

    let baseScore = 0;
    baseScore += correctWithoutHints * 100; // Full points for unassisted correct answers
    baseScore += correctWithHints * 75;    // Reduced points for hint-assisted answers

    // Bonuses
    let accuracyBonus = 0;
    if (levelStats.correct >= 8) accuracyBonus = 200;
    else if (levelStats.correct >= 6) accuracyBonus = 100;
    
    const completionBonus = levelStats.correct === 10 ? 300 : 0;

    // Time bonus calculation
    let timeBonus = 0;
    if (timeTaken < 2) timeBonus = 150;
    else if (timeTaken < 3) timeBonus = 100;
    else if (timeTaken < 4) timeBonus = 75;
    else if (timeTaken < 5) timeBonus = 50;
    else if (timeTaken < 6) timeBonus = 25;

    // Penalties (not used in this level, but keeping for consistency)
    const penalties = 0;

    // Performance rating
    let performanceRating = "Needs Improvement";
    if (accuracy >= 80 && timeTaken < 3) performanceRating = "Excellent";
    else if (accuracy >= 60 && timeTaken < 5) performanceRating = "Good";
    else if (accuracy >= 40 && timeTaken < 7) performanceRating = "Average";

    const totalScore = Math.max(0, baseScore + accuracyBonus + completionBonus + timeBonus - penalties);

    return {
      totalScore,
      baseScore,
      timeBonus,
      accuracyBonus,
      completionBonus,
      penalties,
      timeTaken,
      accuracy,
      performanceRating
    };
  };

  const fetchTeamData = useCallback(async (teamCode: string) => {
    try {
      const response = await fetch(`/api/teams/${teamCode}`);
      if (response.ok) {
        const teamData = await response.json();
        setTeam(teamData);
        
        // Store initial team statistics to track level-specific changes
        setInitialTeamStats({
          correct_questions: teamData.correct_questions,
          incorrect_questions: teamData.incorrect_questions,
          skipped_questions: teamData.skipped_questions,
          hint_count: teamData.hint_count
        });
        
        if (teamData.current_level > 21) {
          toast.info("You've already completed this level!");
          router.push('/levels');
          return;
        }
      } else {
        toast.error("Failed to load team data");
        router.push('/');
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
      toast.error("Failed to load team data");
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [router]);
  
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
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [router, fetchTeamData]);

  // Global game timer
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

  // Check answer validity
  const isAnswerCorrect = (answer: string): boolean => {
    const normalizedAnswer = answer.toLowerCase().trim();
    return currentQuestion.acceptedAnswers.some(accepted => 
      accepted.toLowerCase() === normalizedAnswer
    );
  };

  // Handle virtual keyboard input
  const handleKeyPress = (keyData: { key: string; isSpecial?: boolean }) => {
    if (keyData.isSpecial) {
      if (keyData.key === 'Backspace') {
        setUserAnswer(prev => prev.slice(0, -1));
      } else if (keyData.key === ' ') {
        setUserAnswer(prev => prev + ' ');
      }
    } else {
      setUserAnswer(prev => prev + keyData.key);
    }
  };

  // Handle answer submission
  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim() || submitLoading) {
      return;
    }
    
    setSubmitLoading(true);
    
    try {
      // Mark submit button as used for this question
      setUsedButtons(prev => ({
        ...prev,
        [currentQuestion.id]: { ...prev[currentQuestion.id], submit: true }
      }));

      const isCorrect = isAnswerCorrect(userAnswer);
      
      // Update local stats
      const newStats = { ...levelStats };
      if (isCorrect) {
        newStats.correct++;
        const basePoints = 100;
        const hintPenalty = showHint ? 25 : 0;
        const questionScore = basePoints - hintPenalty;

        setScore(prev => prev + questionScore);
        setAnsweredQuestions(prev => [...prev, currentQuestion.id]);
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

      // Always move to next question regardless of correctness
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setUserAnswer("");
        setShowHint(false);
      } else {
        completeLevel();
      }
    } catch (error) {
      console.error('Error updating answer stats:', error);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle skip functionality
  const handleSkip = async () => {
    if (skipLoading) {
      return;
    }
    
    setSkipLoading(true);
    
    try {
      // Mark skip button as used for this question
      setUsedButtons(prev => ({
        ...prev,
        [currentQuestion.id]: { ...prev[currentQuestion.id], skip: true }
      }));
      
      // Update local stats
      const newStats = { ...levelStats };
      newStats.skipped++;
      setLevelStats(newStats);
      
      // Update team stats in database
      if (!team) return;
      
      const updatedStats = {
        skipped_questions: team.skipped_questions + 1,
        hint_count: team.hint_count + (showHint ? 1 : 0)
      };
      
      await updateTeamStats(updatedStats);

      // Move to next question or complete level
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setUserAnswer("");
        setShowHint(false);
      } else {
        completeLevel();
      }
    } catch (error) {
      console.error('Error updating skip stats:', error);
    } finally {
      setSkipLoading(false);
    }
  };

  // Handle hint functionality
  const handleHint = async () => {
    // Mark hint button as used for this question
    setUsedButtons(prev => ({
      ...prev,
      [currentQuestion.id]: { ...prev[currentQuestion.id], hint: true }
    }));

    setShowHint(true);
    
    // Update local stats
    const newStats = { ...levelStats };
    newStats.hintsUsed++;
    setLevelStats(newStats);
    
    // Update hint count in database
    if (!team) return;
    
    try {
      const updatedStats = {
        hint_count: team.hint_count + 1
      };
      
      await updateTeamStats(updatedStats);
    } catch (error) {
      console.error('Error updating hint stats:', error);
    }
  };

  const completeLevel = async () => {
    if (!team) return;

    const teamCode = localStorage.getItem('team_code');
    if (!teamCode) return;

    // Calculate exact time taken to complete the level at this moment
    const timeTaken = (new Date().getTime() - levelStartTime.getTime()) / 1000 / 60; // minutes
    setCompletionTimeMinutes(timeTaken);

    const scoreData = calculateScore(timeTaken);
    // Store the calculated score data for consistent display
    setCompletionScoreData(scoreData);
    const newTotalScore = team.score + scoreData.totalScore;
    const newLevel = Math.max(team.current_level, 22);

    try {
      // CRITICAL: Ensure final level statistics are accurately saved to database
      if (initialTeamStats) {
        // Calculate the final absolute values that should be in the database
        const finalStats = {
          correct_questions: initialTeamStats.correct_questions + levelStats.correct,
          incorrect_questions: initialTeamStats.incorrect_questions + levelStats.incorrect,
          skipped_questions: initialTeamStats.skipped_questions + levelStats.skipped,
          hint_count: initialTeamStats.hint_count + levelStats.hintsUsed
        };

        console.log('Level completion - Final stats update:', {
          initialStats: initialTeamStats,
          levelStats: levelStats,
          finalStats: finalStats
        });

        // Update final statistics to ensure database accuracy
        await fetch(`/api/teams/${teamCode}/stats`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalStats)
        });
      }

      // Update score and level
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Level 21...</p>
        </div>
      </div>
    );
  }

  if (timerStatus === 'expired') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-2xl text-red-600">Game Time Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              The overall game time has expired. You can no longer play levels.
            </p>
            <Button onClick={() => router.push('/levels')} className="bg-blue-600 hover:bg-blue-700">
              Return to Levels
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  // Level completion screen
  if (isCompleted && completionScoreData) {
    // Use the stored score data that was calculated during level completion
    // This ensures the displayed score exactly matches what was sent to the API
    const scoreData = completionScoreData;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-700">Brand Recognition Master! 🏆</CardTitle>
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
                <div className="text-sm text-indigo-600">correct answers</div>
              </div>
            </div>

            {/* Detailed Score Breakdown */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-center text-blue-700 mb-4">Score Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Base Score (Correct Answers)</span>
                  <span className="font-semibold text-green-600">+{scoreData.baseScore.toLocaleString()}</span>
                </div>
                {scoreData.accuracyBonus > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Accuracy Bonus</span>
                    <span className="font-semibold text-blue-600">+{scoreData.accuracyBonus.toLocaleString()}</span>
                  </div>
                )}
                {scoreData.completionBonus > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Completion Bonus</span>
                    <span className="font-semibold text-purple-600">+{scoreData.completionBonus.toLocaleString()}</span>
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
                    <span className="text-gray-700">Penalties</span>
                    <span className="font-semibold text-red-600">-{scoreData.penalties.toLocaleString()}</span>
                  </div>
                )}
                <hr className="border-gray-300" />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-blue-700">Total Level Score</span>
                  <span className="text-blue-700">+{scoreData.totalScore.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Performance Feedback */}
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">Performance Feedback</h4>
              <p className="text-sm text-gray-600">
                {scoreData.performanceRating === 'Excellent' &&
                  "Outstanding performance! Your brand recognition skills are exceptional. You quickly identified most brands correctly!"}
                {scoreData.performanceRating === 'Good' &&
                  "Great job! You have good brand recognition skills and completed the challenge efficiently."}
                {scoreData.performanceRating === 'Average' &&
                  "Good effort! Your brand recognition skills are developing well. Keep learning to recognize more brands."}
                {scoreData.performanceRating === 'Needs Improvement' &&
                  "Keep practicing your brand recognition skills. Focus on being more familiar with common brand logos."}
              </p>
            </div>

            <Button
              onClick={() => router.push('/levels')}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-6 text-lg font-bold"
            >
              Continue to Level 22
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 rounded-full p-3">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Level 21 - Brand Logo Recognition</h1>
                <p className="text-gray-600">Identify the famous brand logos</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Global Timer */}
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                <Timer className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">
                  {formatTimeRemaining(timeRemaining)}
                </span>
              </div>

              {/* Team Score */}
              {team && (
                <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg">
                  <Trophy className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">
                    {team.score.toLocaleString()} pts
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Progress */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span className="text-lg font-semibold text-gray-800">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>
          </div>

          <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-2" />

          {/* Question Card */}
          <Card className="p-8">
            <CardContent className="space-y-6">
              {/* Logo Display */}
              <div className="text-center">
                <div className="bg-white p-8 rounded-lg shadow-inner border-2 border-gray-100 inline-block">
                  <img
                    src={currentQuestion.logoImage}
                    alt="Brand Logo"
                    className="max-w-xs max-h-48 object-contain mx-auto"
                    onError={(e) => {
                      // Fallback for missing images
                      e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='100' viewBox='0 0 200 100'%3E%3Crect width='200' height='100' fill='%23f3f4f6'/%3E%3Ctext x='100' y='50' text-anchor='middle' dy='0.3em' font-family='Arial' font-size='14' fill='%236b7280'%3ELogo Image%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  What brand does this logo represent?
                </h2>
                <p className="text-gray-600">
                  Type the brand name using the virtual keyboard below
                </p>
              </div>

              {/* Answer Input */}
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    ref={inputRef}
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Enter brand name..."
                    className="text-center text-xl py-4 border-2 border-blue-200 focus:border-blue-500"
                    maxLength={50}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">
                    {userAnswer.length}/50
                  </div>
                </div>

                {/* Virtual Keyboard */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <KeyboardIcon className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Virtual Keyboard</span>
                  </div>
                  <Keyboard
                    layout={keyboardLayout}
                    onKeyPress={handleKeyPress}
                    className="max-w-2xl mx-auto"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Hint Section */}
                {!showHint ? (
                  <Button
                    variant="outline"
                    onClick={handleHint}
                    disabled={usedButtons[currentQuestion.id]?.hint}
                    className="w-full border-yellow-200 text-yellow-700 hover:bg-yellow-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    {usedButtons[currentQuestion.id]?.hint ? "Hint Used" : "Show Hint"}
                  </Button>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-yellow-700">Hint</span>
                    </div>
                    <p className="text-yellow-700">{currentQuestion.hint}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!userAnswer.trim() || usedButtons[currentQuestion.id]?.submit || submitLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white rounded-full border-t-transparent"></div>
                      Submitting...
                    </>
                  ) : usedButtons[currentQuestion.id]?.submit ? "Answer Submitted" : "Submit Answer"}
                </Button>

                {/* Skip Button */}
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  disabled={usedButtons[currentQuestion.id]?.skip || skipLoading}
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {skipLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-red-600 rounded-full border-t-transparent"></div>
                      Skipping...
                    </>
                  ) : (
                    <>
                      <SkipForward className="h-4 w-4 mr-2" />
                      {usedButtons[currentQuestion.id]?.skip ? "Question Skipped" : "Skip Question"}
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
