"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Timer, HelpCircle, ArrowRight, CheckCircle, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Team, getGameTimeRemaining, formatTimeRemaining, getGameTimerStatus } from "@/lib/supabase";

interface MathQuestion {
  id: number;
  question: string;
  answer: string;
  hint: string;
}

const mathQuestions: MathQuestion[] = [
  {
    id: 1,
    question: "If: SUN = 54, MOON = 57, What is STAR?",
    answer: "58",
    hint: "A=1, B=2… Add letters"
  },
  {
    id: 2,
    question: "I am a two-digit number. My tens digit is twice my ones digit. If you reverse me, the new number is 27 less. What number am I?",
    answer: "63",
    hint: "Think about two-digit numbers where tens = 2 × ones, then check the reverse condition"
  },
  {
    id: 3,
    question: "Replace ❓ with the correct number: 8 + 8 ÷ 8 + 8 × 8 – 8 = ❓",
    answer: "65",
    hint: "Remember order of operations: division and multiplication first, then addition and subtraction"
  },
  {
    id: 4,
    question: "Which number doesn't belong in the series? 2, 4, 8, 16, 24, 32, 64",
    answer: "24",
    hint: "Look for the pattern - most numbers are powers of 2"
  },
  {
    id: 5,
    question: "The sum of the ages of three siblings is 36. The oldest is twice as old as the youngest, and the middle child is 2 years older than the youngest. Find the age of the oldest?",
    answer: "17",
    hint: "Let youngest = x, then middle = x+2, oldest = 2x. Sum = x + (x+2) + 2x = 36"
  },
  {
    id: 6,
    question: "A book has 100 pages. If you number them from 1 to 100, how many times will the digit '7' be written?",
    answer: "20",
    hint: "Count 7s in units place (7,17,27...97) and tens place (70,71,72...79)"
  },
  {
    id: 7,
    question: "A man spends 1/2 of his money on food, 1/3 on rent, and has ₹50 left. How much money did he originally have?",
    answer: "300",
    hint: "If he spends 1/2 + 1/3 = 5/6 of his money, then 1/6 remains = ₹50"
  },
  {
    id: 8,
    question: "Find the next number in the sequence: 3, 6, 12, 24, 48, ?",
    answer: "96",
    hint: "Each number is multiplied by 2 to get the next number"
  },
  {
    id: 9,
    question: "👟 + 👟 + 👟 = 30, 👟 + 👒 + 👒 = 20, 👒 + 👜 + 👜 = 9. Find 👟 + 👒 × 👜",
    answer: "20",
    hint: "Find individual values: 👟=10, 👒=5, 👜=2. Remember order of operations!"
  },
  {
    id: 10,
    question: "If 12 → 21, 23 → 36, 34 → 49, then 45 → ?",
    answer: "36",
    hint: "Look at the pattern: reverse the digits, then subtract 9 from the result"
  }
];

export default function Level15Page() {
  const [team, setTeam] = useState<Team | null>(null);
  const [initialTeamStats, setInitialTeamStats] = useState<{
    correct_questions: number;
    incorrect_questions: number;
    skipped_questions: number;
    hint_count: number;
  } | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [showHint, setShowHint] = useState(false);
  const [levelStartTime] = useState<Date>(new Date());
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [timerStatus, setTimerStatus] = useState<'not_started' | 'active' | 'expired'>('not_started');
  const [, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [skipLoading, setSkipLoading] = useState(false);
  const [flashState, setFlashState] = useState<'correct' | 'incorrect' | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [, setCompletionTimeMinutes] = useState<number>(0);
  const [levelStats, setLevelStats] = useState({
    correct: 0,
    incorrect: 0,
    skipped: 0,
    hintsUsed: 0
  });
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

      if (teamData.current_level > 15) {
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

  // Auto-clear flash state after short animation
  useEffect(() => {
    if (flashState) {
      const t = setTimeout(() => setFlashState(null), 800);
      return () => clearTimeout(t);
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

  const handleNumberInput = (num: string) => {
    if (userAnswer.length < 10) { // Limit input length
      setUserAnswer(prev => prev + num);
    }
  };

  const handleBackspace = () => {
    setUserAnswer(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setUserAnswer("");
  };

  const handleHint = () => {
    setShowHint(true);
    const newStats = { ...levelStats };
    newStats.hintsUsed++;
    setLevelStats(newStats);
  };

  const validateAnswer = () => {
    const currentQuestion = mathQuestions[currentQuestionIndex];
    const correctAnswer = currentQuestion.answer;
    
    // Check length and correctness
    if (userAnswer.length !== correctAnswer.length) {
      return false;
    }
    
    return userAnswer === correctAnswer;
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      toast.error("Please enter an answer");
      return;
    }

    if (submitLoading) return;
    setSubmitLoading(true);

    try {
      const isCorrect = validateAnswer();

      // Trigger flash effect for visual feedback
      setFlashState(isCorrect ? 'correct' : 'incorrect');

      const newStats = { ...levelStats };
      if (isCorrect) {
        newStats.correct++;
      } else {
        newStats.incorrect++;
      }
      setLevelStats(newStats);

      // Update team stats only if team is available
      if (team) {
        const updatedStats = {
          correct_questions: team.correct_questions + (isCorrect ? 1 : 0),
          incorrect_questions: team.incorrect_questions + (isCorrect ? 0 : 1),
          hint_count: team.hint_count + (showHint ? 1 : 0)
        };

        await updateTeamStats(updatedStats);
      }

      // Advance to next question regardless of correctness
      if (currentQuestionIndex < mathQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setUserAnswer("");
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

      if (currentQuestionIndex < mathQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setUserAnswer("");
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

    const baseScore = levelStats.correct * 2000;
    const penalties = (levelStats.incorrect * 500) + (levelStats.skipped * 750);
    // No consecutive tracking in this level - set consecutive bonus to 0 for compatibility
    const consecutiveBonus = 0;

    let timeBonus = 0;
    if (timeTaken < 2) timeBonus = 500;
    else if (timeTaken < 3) timeBonus = 400;
    else if (timeTaken < 4) timeBonus = 300;
    else if (timeTaken < 5) timeBonus = 200;
    else if (timeTaken < 6) timeBonus = 100;

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

    const totalScore = Math.max(0, baseScore + timeBonus + consecutiveBonus - penalties);

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
    const newLevel = 16;

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

  // Fallback while final score is being prepared
  if (isCompleted && !completionScoreData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Calculating final score...</p>
        </div>
      </div>
    );
  }

  // Flash effect component
  const FlashEffect = () => {
    if (!flashState) return null;
    return (
      <div
        className={`fixed inset-0 z-50 pointer-events-none animate-flash ${
          flashState === 'correct' ? 'bg-green-500/30' : 'bg-red-500/30'
        }`} />
    );
  };

  if (isCompleted && completionScoreData) {
    // Use the stored score data that was calculated during level completion
    // This ensures the displayed score exactly matches what was sent to the API
    const scoreData = completionScoreData as NonNullable<typeof completionScoreData>;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
        <FlashEffect />
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-700">Level 15 Complete!</CardTitle>
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

            {/* Score Summary */}
            {scoreData && (
              <div className="mt-6">
                <div className="grid grid-cols-3 gap-4 text-center mb-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-sm text-green-600 font-medium mb-1">Final Score</div>
                    <div className="text-2xl font-bold text-green-600">{scoreData.totalScore.toLocaleString()}</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-sm text-blue-600 font-medium mb-1">Time</div>
                    <div className="text-2xl font-bold text-blue-600">{scoreData.timeTaken.toFixed(1)}m</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-sm text-purple-600 font-medium mb-1">Rating</div>
                    <div className="text-lg font-bold text-purple-600">{scoreData.performanceRating}</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-sm">
                  <h4 className="font-semibold text-gray-800 mb-2">Score Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Base Score</span>
                      <span className="font-semibold text-green-600">+{scoreData.baseScore}</span>
                    </div>
                    {scoreData.timeBonus > 0 && (
                      <div className="flex justify-between">
                        <span>Time Bonus</span>
                        <span className="font-semibold text-blue-600">+{scoreData.timeBonus}</span>
                      </div>
                    )}
                    {scoreData.consecutiveBonus > 0 && (
                      <div className="flex justify-between">
                        <span>Consecutive Bonus</span>
                        <span className="font-semibold text-purple-600">+{scoreData.consecutiveBonus}</span>
                      </div>
                    )}
                    {scoreData.penalties > 0 && (
                      <div className="flex justify-between">
                        <span>Penalties</span>
                        <span className="font-semibold text-red-600">-{scoreData.penalties}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Total Score</span>
                      <span className="text-green-600">{scoreData.totalScore.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

             <Button
               onClick={() => router.push('/levels')}
               className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg py-3"
             >
               Continue to Level 16
               <ArrowRight className="ml-2 h-5 w-5" />
             </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = mathQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / mathQuestions.length) * 100;

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
      <FlashEffect />
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-purple-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Level 15 - Math Puzzle
              </Badge>
              <span className="text-lg font-semibold text-gray-800">{team?.team_name ?? 'Loading...'}</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <span className="text-lg font-semibold text-gray-800">
                  {team?.score != null ? team.score.toLocaleString() : '0'} pts
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
              {/* <span>{Math.round(progress)}% Complete</span> */}
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
                <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 mb-4">
                  <div className="text-3xl font-mono font-bold text-gray-800 min-h-[3rem] flex items-center justify-center">
                    {userAnswer || "Enter your answer..."}
                  </div>
                </div>
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
                  disabled={showHint}
                  className="flex-1"
                >
                  <HelpCircle className="mr-2 h-4 w-4" />
                  {showHint ? "Hint Shown" : "Show Hint"}
                </Button>
                
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
                  disabled={!userAnswer || submitLoading}
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