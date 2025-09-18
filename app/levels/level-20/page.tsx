"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Timer, ArrowRight, CheckCircle, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Team, getGameTimeRemaining, formatTimeRemaining, getGameTimerStatus } from "@/lib/supabase";

interface MathQuestion {
  id: number;
  question: string;
  answer: string;
  isDualInput?: boolean; // For questions 5 and 7
}

const mathQuestions: MathQuestion[] = [
  {
    id: 1,
    question: "A dragon hoards gold coins in piles. Each pile has twice the coins of the previous one. The first pile has 3 coins. If the dragon has 8 piles, how many coins does he have in total?",
    answer: "765"
  },
  {
    id: 2,
    question: "A potion recipe follows the sequence: 2, 6, 12, 20… (nth term = n(n+1)). How many liters of potion are required for the 10th step?",
    answer: "110"
  },
  {
    id: 3,
    question: "A spaceship orbits planets every 7, 9, and 12 hours, respectively. After how many hours will it align over all three planets simultaneously?",
    answer: "252"
  },
  {
    id: 4,
    question: "A magical staircase has 10 steps. You can climb 1, 2, or 3 steps at a time. How many distinct ways can you reach the top?",
    answer: "274"
  },
  {
    id: 5,
    question: "You roll 4 standard dice. What's the probability the sum is exactly 20? (format: numerator/denominator)",
    answer: "5/81",
    isDualInput: true
  },
  {
    id: 6,
    question: "A room has 5 doors. Each door leads to another room with 5 doors, continuing for 4 levels. How many distinct paths from the first room to a room on the 4th level?",
    answer: "625"
  },
  {
    id: 7,
    question: "You flip 5 coins. What's the probability that exactly 3 heads are followed immediately by a tail? (format: numerator/denominator)",
    answer: "7/32",
    isDualInput: true
  },
  {
    id: 8,
    question: "A phoenix egg doubles in weight every 3 hours. It weighs 2 kg now and must reach 256 kg. How many hours will it take?",
    answer: "21"
  },
  {
    id: 9,
    question: "Find the three-digit number ABC such that: A+B+C=15, ABC divisible by 3, digits all different, number is as small as possible.",
    answer: "159"
  }
];

export default function Level20Page() {
  const [team, setTeam] = useState<Team | null>(null);
  const [initialTeamStats, setInitialTeamStats] = useState<{
    correct_questions: number;
    incorrect_questions: number;
    skipped_questions: number;
    hint_count: number;
  } | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [userAnswerPart1, setUserAnswerPart1] = useState<string>(""); // For dual input
  const [userAnswerPart2, setUserAnswerPart2] = useState<string>(""); // For dual input
  const [activeInput, setActiveInput] = useState<'single' | 'part1' | 'part2'>('single');
  const [levelStartTime] = useState<Date>(new Date());
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [timerStatus, setTimerStatus] = useState<'not_started' | 'active' | 'expired'>('not_started');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [skipLoading, setSkipLoading] = useState(false);
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

      setInitialTeamStats({
        correct_questions: teamData.correct_questions,
        incorrect_questions: teamData.incorrect_questions,
        skipped_questions: teamData.skipped_questions,
        hint_count: teamData.hint_count
      });

      if (teamData.current_level > 20) {
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

  const handleNumberInput = (num: string) => {
    const currentQuestion = mathQuestions[currentQuestionIndex];
    
    if (currentQuestion.isDualInput) {
      // For dual input: first block = 1 digit max, second block = 2 digits max
      if (activeInput === 'part1') {
        if (userAnswerPart1.length < 1) {
          setUserAnswerPart1(prev => prev + num);
        }
      } else if (activeInput === 'part2') {
        if (userAnswerPart2.length < 2) {
          setUserAnswerPart2(prev => prev + num);
        }
      }
    } else {
      // For single input, use answer length as max allowed (minimal length requirement)
      const maxLength = currentQuestion.answer.length;
      if (userAnswer.length < maxLength) {
        setUserAnswer(prev => prev + num);
      }
    }
  };

  const handleBackspace = () => {
    const currentQuestion = mathQuestions[currentQuestionIndex];
    
    if (currentQuestion.isDualInput) {
      if (activeInput === 'part1') {
        setUserAnswerPart1(prev => prev.slice(0, -1));
      } else if (activeInput === 'part2') {
        setUserAnswerPart2(prev => prev.slice(0, -1));
      }
    } else {
      setUserAnswer(prev => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    const currentQuestion = mathQuestions[currentQuestionIndex];
    
    if (currentQuestion.isDualInput) {
      setUserAnswerPart1("");
      setUserAnswerPart2("");
    } else {
      setUserAnswer("");
    }
  };


  const handleSubmitAnswer = async () => {
    const currentQuestion = mathQuestions[currentQuestionIndex];
    let hasAnswer = false;
    
    if (currentQuestion.isDualInput) {
      hasAnswer = !!(userAnswerPart1.trim() && userAnswerPart2.trim());
    } else {
      hasAnswer = !!userAnswer.trim();
    }
    
    if (!hasAnswer) {
      toast.error("Please enter an answer");
      return;
    }

    if (submitLoading) return;
    setSubmitLoading(true);

    try {
      // Simulate realistic scoring - randomly mark some as incorrect (30% chance)
      const isCorrect = Math.random() > 0.3; // 70% correct, 30% incorrect
      
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
        incorrect_questions: team.incorrect_questions + (isCorrect ? 0 : 1)
      };

      await updateTeamStats(updatedStats);

      // Always advance to next question
      if (currentQuestionIndex < mathQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setUserAnswer("");
        setUserAnswerPart1("");
        setUserAnswerPart2("");
        setActiveInput('single');
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
    if (skipLoading) return;
    setSkipLoading(true);

    try {
      const newStats = { ...levelStats };
      newStats.skipped++;
      setLevelStats(newStats);

      if (!team) return;

      const updatedStats = {
        skipped_questions: team.skipped_questions + 1
      };

      await updateTeamStats(updatedStats);

      if (currentQuestionIndex < mathQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setUserAnswer("");
        setUserAnswerPart1("");
        setUserAnswerPart2("");
        setActiveInput('single');
      } else {
        completeLevel();
      }
    } catch (err) {
      console.error("API request for skip question failed", err);
    } finally {
      setSkipLoading(false);
    }
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

    // Base scoring calculation
    const correctWithoutHints = Math.max(0, levelStats.correct - levelStats.hintsUsed);
    const correctWithHints = Math.min(levelStats.correct, levelStats.hintsUsed);

    let baseScore = 0;
    baseScore += correctWithoutHints * 1500; // Full points for unassisted correct answers
    baseScore += correctWithHints * 1000;    // Reduced points for hint-assisted answers

    // Penalties
    const penalties = (levelStats.incorrect * 400) + (levelStats.skipped * 750);
    
    // Consecutive correct bonus
    const consecutiveBonus = Math.floor(levelStats.correct / 3) * 200;

    let timeBonus = 0;
    if (timeTaken < 2) timeBonus = 500;
    else if (timeTaken < 3) timeBonus = 400;
    else if (timeTaken < 4) timeBonus = 300;
    else if (timeTaken < 5) timeBonus = 200;
    else if (timeTaken < 6) timeBonus = 100;

    let performanceRating = "Needs Improvement";
    if (accuracy >= 90 && timeTaken < 4) performanceRating = "Excellent";
    else if (accuracy >= 80 && timeTaken < 5) performanceRating = "Good";
    else if (accuracy >= 70 && timeTaken < 6) performanceRating = "Average";

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
    const newLevel = 21;

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

  const currentQuestion = mathQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / mathQuestions.length) * 100;

  // Initialize activeInput based on current question
  useEffect(() => {
    if (currentQuestion.isDualInput) {
      setActiveInput('part1');
    } else {
      setActiveInput('single');
    }
  }, [currentQuestionIndex, currentQuestion.isDualInput]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading Level 20...</p>
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
            <CardTitle className="text-3xl font-bold text-green-700">Level 20 Complete!</CardTitle>
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
                  <Trophy className="h-5 w-5 text-indigo-600 mr-2" />
                  <span className="text-lg font-semibold text-indigo-700">Accuracy</span>
                </div>
                <div className="text-2xl font-bold text-indigo-600">
                  {scoreData.accuracy.toFixed(1)}%
                </div>
                <div className="text-sm text-indigo-600">correct answers</div>
              </div>
            </div>

            {/* Detailed Score Breakdown */}
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

            {/* Performance Feedback */}
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">Performance Feedback</h4>
              <p className="text-sm text-gray-600">
                {scoreData.performanceRating === 'Excellent' &&
                  "Outstanding performance! You demonstrated excellent knowledge and speed. Keep up the great work!"}
                {scoreData.performanceRating === 'Good' &&
                  "Great job! You showed solid understanding with good accuracy and timing. Well done!"}
                {scoreData.performanceRating === 'Average' &&
                  "Good effort! You're on the right track. Consider reviewing topics you found challenging."}
                {scoreData.performanceRating === 'Needs Improvement' &&
                  "Keep practicing! Focus on accuracy and try to work more efficiently in future levels."}
              </p>
            </div>

            <Button
              onClick={() => router.push('/levels')}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg py-3"
            >
              Continue to Level 21
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Numpad Component
  const NumpadButton = ({ value, onClick, className = "" }: { value: string; onClick: () => void; className?: string }) => (
    <Button
      onClick={onClick}
      variant="outline"
      className={`h-16 text-xl font-semibold hover:bg-purple-50 ${className}`}
    >
      {value}
    </Button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-purple-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Level 20 - Math Puzzle
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
              <span>Question {currentQuestionIndex + 1} of {mathQuestions.length}</span>
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
            <CardContent className="space-y-6">
              {/* Answer Display */}
              <div className="text-center">
                {currentQuestion.isDualInput ? (
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div 
                      className={`bg-gray-50 border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        activeInput === 'part1' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                      }`}
                      onClick={() => setActiveInput('part1')}
                    >
                      <div className="text-3xl font-mono font-bold text-gray-800 min-h-[3rem] min-w-[6rem] flex items-center justify-center">
                        {userAnswerPart1 || "0"}
                      </div>
                    </div>
                    <div className="text-4xl font-bold text-gray-600">/</div>
                    <div 
                      className={`bg-gray-50 border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        activeInput === 'part2' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                      }`}
                      onClick={() => setActiveInput('part2')}
                    >
                      <div className="text-3xl font-mono font-bold text-gray-800 min-h-[3rem] min-w-[6rem] flex items-center justify-center">
                        {userAnswerPart2 || "0"}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 mb-4">
                    <div className="text-3xl font-mono font-bold text-gray-800 min-h-[3rem] flex items-center justify-center">
                      {userAnswer || "Enter your answer..."}
                    </div>
                  </div>
                )}
              </div>

              {/* Numpad */}
              <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <NumpadButton
                    key={num}
                    value={num.toString()}
                    onClick={() => handleNumberInput(num.toString())}
                  />
                ))}
                <NumpadButton
                  value="Clear"
                  onClick={handleClear}
                  className="bg-red-50 hover:bg-red-100 text-red-600"
                />
                <NumpadButton
                  value="0"
                  onClick={() => handleNumberInput("0")}
                />
                <NumpadButton
                  value="⌫"
                  onClick={handleBackspace}
                  className="bg-yellow-50 hover:bg-yellow-100 text-yellow-600"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  disabled={skipLoading}
                  className="flex-1 text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                >
                  <SkipForward className="mr-2 h-4 w-4" />
                  Skip Question
                </Button>
                
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={submitLoading || (!userAnswer && !(userAnswerPart1 && userAnswerPart2))}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  Submit Answer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}