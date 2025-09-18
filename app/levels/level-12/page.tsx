'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { getGameTimeRemaining, getGameTimerStatus, formatTimeRemaining } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Trophy,
  Timer,
  CheckCircle,
  SkipForward,
  ArrowRight,
  Target,
  Keyboard,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';

interface ImagePuzzle {
  id: number;
  imagePath: string;
  answer: string;
  category: string;
}

interface Team {
  id: string;
  team_name: string;
  team_code: string;
  score: number;
  game_loaded: boolean;
  game_start_time: string | null;
  checkpoint_score: number;
  checkpoint_level: number;
  current_level: number;
  correct_questions: number;
  incorrect_questions: number;
  skipped_questions: number;
  hint_count: number;
  created_at: string;
  updated_at: string;
}

interface TeamStats {
  correct_questions: number;
  incorrect_questions: number;
  skipped_questions: number;
  hint_count: number;
}

export default function Level12Page() {
  const router = useRouter();

  // Game state
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [flashState, setFlashState] = useState<'correct' | 'incorrect' | null>(null);
  const [skipLoading, setSkipLoading] = useState(false);

  // Team and stats
  const [team, setTeam] = useState<Team | null>(null);
  const [levelStats, setLevelStats] = useState({
    correct: 0,
    incorrect: 0,
    skipped: 0,
  });
  const [initialTeamStats, setInitialTeamStats] = useState<TeamStats | null>(null);

  // Timer
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerStatus, setTimerStatus] = useState<'not_started' | 'active' | 'expired'>('not_started');
  const [levelStartTime] = useState(new Date());
  const [completionTimeMinutes, setCompletionTimeMinutes] = useState(0);
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

  // Image puzzles data
  const puzzles: ImagePuzzle[] = [
    { id: 1, imagePath: '/levels/level-12/img1.webp', answer: 'APPLE PIE', category: 'Food' },
    { id: 2, imagePath: '/levels/level-12/img2.png', answer: 'FORGET IT', category: 'Expression' },
    { id: 3, imagePath: '/levels/level-12/img3.png', answer: 'FADE AWAY', category: 'Action' },
    { id: 4, imagePath: '/levels/level-12/img4.png', answer: 'EYESHADOW', category: 'Cosmetics' },
    { id: 5, imagePath: '/levels/level-12/img5.png', answer: 'CAVEMAN', category: 'Person' },
    { id: 6, imagePath: '/levels/level-12/img6.png', answer: '3D MOVIE', category: 'Entertainment' },
    { id: 7, imagePath: '/levels/level-12/img7.png', answer: 'FIRST AID', category: 'Medical' },
    { id: 8, imagePath: '/levels/level-12/img8.png', answer: 'BUCKET LIST', category: 'Concept' },
    { id: 9, imagePath: '/levels/level-12/img9.png', answer: 'ROBIN HOOD', category: 'Character' },
    { id: 10, imagePath: '/levels/level-12/img10.png', answer: 'WATERFALL', category: 'Nature' },
  ];

  // Removed duplicate puzzles array

  const fetchTeamData = useCallback(
    async (teamCode: string) => {
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
          hint_count: teamData.hint_count,
        });

        if (teamData.current_level < 12) {
          toast.info('You need to complete previous levels first!');
          router.push('/levels');
          return;
        }

        if (teamData.current_level > 12) {
          toast.info('You&apos;ve already completed this level!');
          router.push('/levels');
          return;
        }

        // Initialize timer status (match Levels page)
        const status = getGameTimerStatus(teamData);
        setTimerStatus(status);
        setTimeRemaining(getGameTimeRemaining(teamData));
      } catch (error) {
        console.error('Error fetching team data:', error);
        toast.error('Failed to load team data. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

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

  // Removed timer effect to place it after completeLevel definition

  // Navigation protection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isCompleted) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isCompleted]);

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

  // Get answer format description using regex
  const getAnswerFormat = (answer: string): string => {
    const words = answer.trim().split(/\s+/);
    const wordCount = words.length;
    
    if (wordCount === 1) {
      return "One word";
    } else if (wordCount === 2) {
      return "Two words";
    } else if (wordCount === 3) {
      return "Three words";
    } else {
      return `${wordCount} words`;
    }
  };

  // Character validation function - allows all characters
  const validateInput = (newValue: string, targetAnswer: string, showPopup: boolean = false): string => {
    // Convert to uppercase
    let validatedInput = newValue.toUpperCase();
    
    // Check length limit (should not exceed target length)
    if (validatedInput.length > targetAnswer.length) {
      if (showPopup) {
        toast.error("Maximum character limit reached");
      }
      validatedInput = validatedInput.substring(0, targetAnswer.length);
    }
    
    return validatedInput;
  };

  const handleAnswer = async () => {
    if (!userAnswer.trim()) return;
    
    const currentPuzzle = puzzles[currentPuzzleIndex];
    const expectedWords = currentPuzzle.answer.trim().split(/\s+/);
    const inputWords = userAnswer.trim().split(/\s+/);
    
    // Check if answer requires multiple words but input has different word count
    if (expectedWords.length > 1 && inputWords.length !== expectedWords.length) {
      if (expectedWords.length === 2) {
        toast.error("The answer is two words separated by space");
      } else {
        toast.error(`The answer is ${expectedWords.length} words separated by space`);
      }
      return;
    }
    
    setSubmitLoading(true);
    const isCorrect = userAnswer.toUpperCase().trim() === currentPuzzle.answer.toUpperCase();

    // Trigger flash effect for visual feedback
    setFlashState(isCorrect ? 'correct' : 'incorrect');

    try {
      if (isCorrect) {
        setLevelStats(prev => ({ ...prev, correct: prev.correct + 1 }));
      } else {
        setLevelStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
      }
      
      if (currentPuzzleIndex < puzzles.length - 1) {
        setCurrentPuzzleIndex(currentPuzzleIndex + 1);
        setUserAnswer("");
      } else {
        completeLevel();
      }
    } catch (err) {
      console.error("Error submitting answer:", err);
      toast.error("Failed to submit answer. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSkip = async () => {
    setSkipLoading(true);
    
    try {
      setLevelStats(prev => ({ ...prev, skipped: prev.skipped + 1 }));
      
      if (currentPuzzleIndex < puzzles.length - 1) {
        setCurrentPuzzleIndex(currentPuzzleIndex + 1);
        setUserAnswer("");
      } else {
        completeLevel();
      }
    } catch (err) {
      console.error("API request for skip question failed", err);
    } finally {
      setSkipLoading(false);
    }
  };

  const calculateScore = useCallback((completionTime?: number): {
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

    const correctWithoutHints = levelStats.correct;
    const baseScore = correctWithoutHints * 1500;

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
  }, [levelStats, levelStartTime]);

  const completeLevel = useCallback(async () => {
    if (!team) return;

    const teamCode = localStorage.getItem('team_code');
    if (!teamCode) return;

    const timeTaken = (new Date().getTime() - levelStartTime.getTime()) / 1000 / 60;
    setCompletionTimeMinutes(timeTaken);

    const scoreData = calculateScore(timeTaken);
    // Store the calculated score data for consistent display
    setCompletionScoreData(scoreData);
    const newTotalScore = team.score + scoreData.totalScore;
    const newLevel = 13;

    try {
      if (initialTeamStats) {
        const finalStats = {
          correct_questions: initialTeamStats.correct_questions + levelStats.correct,
          incorrect_questions: initialTeamStats.incorrect_questions + levelStats.incorrect,
          skipped_questions: initialTeamStats.skipped_questions + levelStats.skipped,
          hint_count: initialTeamStats.hint_count
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
  }, [team, levelStats, initialTeamStats, calculateScore, levelStartTime, setCompletionTimeMinutes, setIsCompleted]);

  // Timer effect
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
  }, [team, timerStatus, completeLevel]);

  // Add useEffect to reset flash state after animation
  useEffect(() => {
    if (flashState) {
      const timer = setTimeout(() => {
        setFlashState(null);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [flashState]);

  const DisplayKeyboard = () => {
    const currentPuzzle = puzzles[currentPuzzleIndex];
    
    const keys = [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
      ['space', 'backspace']
    ];

    const handleKeyPress = (key: string) => {
      if (key === 'space') {
        const newValue = userAnswer + ' ';
        const validatedValue = validateInput(newValue, currentPuzzle.answer, true);
        setUserAnswer(validatedValue);
      } else if (key === 'backspace') {
        setUserAnswer(prev => prev.slice(0, -1));
      } else {
        const newValue = userAnswer + key.toUpperCase();
        const validatedValue = validateInput(newValue, currentPuzzle.answer, true);
        setUserAnswer(validatedValue);
      }
    };

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center mb-3">
          <Keyboard className="h-5 w-5 text-gray-600 mr-2" />
          <span className="text-sm font-medium text-gray-700">Display Keyboard</span>
        </div>
        <div className="space-y-2">
          {keys.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-1">
              {row.map((key) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  className={`min-w-[2.5rem] h-8 text-xs ${
                    key === 'space' ? 'min-w-[8rem]' : 
                    key === 'backspace' ? 'min-w-[4rem]' : ''
                  }`}
                  onClick={() => handleKeyPress(key)}
                >
                  {key === 'space' ? 'Space' : key === 'backspace' ? '⌫' : key.toUpperCase()}
                </Button>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading Level 12...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Failed to load team data.</p>
          <Button onClick={() => router.push('/')} className="mt-4">
            Return to Home
          </Button>
        </div>
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
            <CardTitle className="text-3xl font-bold text-green-700">Level 12 Complete! 🎉</CardTitle>
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Timer className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-lg font-semibold text-blue-700">Time Taken</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.floor(completionTimeMinutes)}:{String(Math.floor((completionTimeMinutes % 1) * 60)).padStart(2, '0')}
                </div>
                <div className="text-sm text-blue-600">minutes</div>
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

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-center text-blue-700 mb-4">Score Breakdown</h3>
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
                  <span className="text-blue-700">Total Level Score</span>
                  <span className="text-blue-700">+{scoreData.totalScore.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => router.push('/levels')}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-lg py-3"
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

  const currentPuzzle = puzzles[currentPuzzleIndex];
  const progress = ((currentPuzzleIndex + 1) / puzzles.length) * 100;
  const timerDisplay = getTimerDisplay();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <FlashEffect />
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Trophy className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-blue-800">Level 12 - Image Recognition</h1>
              </div>
              <Badge variant="outline" className="text-blue-700 border-blue-300">
                {currentPuzzleIndex + 1} of {puzzles.length}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Timer className={`h-5 w-5 ${timerStatus === 'not_started' ? 'text-gray-500' : 'text-red-600'}`} />
              <span className={`font-mono text-lg font-semibold ${timerDisplay.className}`}>
                {timerDisplay.text}
              </span>
            </div>
          </div>
          
          <Progress value={progress} className="h-2 bg-blue-100" />
          <p className="text-sm text-gray-600 mt-2">
            Progress: {currentPuzzleIndex + 1}/{puzzles.length} images completed
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">
              <div className="flex items-center justify-center mb-4">
                <ImageIcon className="h-8 w-8 text-blue-600 mr-2" />
                <span className="text-2xl font-bold text-blue-800">What do you see in this image?</span>
              </div>
              <Badge variant="secondary" className="mt-2">
                Category: {currentPuzzle.category}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <div className="relative w-full max-w-md h-64 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                <Image
                  src={currentPuzzle.imagePath}
                  alt={`Puzzle ${currentPuzzle.id}`}
                  fill
                  className="object-cover"
                  onError={() => {
                    // Handle error by showing a fallback image
                    const fallbackImage = document.getElementById(`puzzle-image-${currentPuzzle.id}`) as HTMLImageElement;
                    if (fallbackImage) {
                      fallbackImage.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';
                    }
                  }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  id={`puzzle-image-${currentPuzzle.id}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Your Answer:</label>
              <div className="mb-2">
                <Badge variant="secondary" className="text-sm">
                  Format: {getAnswerFormat(currentPuzzle.answer)}
                </Badge>
              </div>
              <Input
                value={userAnswer}
                onChange={(e) => {
                  const validatedValue = validateInput(e.target.value, currentPuzzle.answer, true);
                  setUserAnswer(validatedValue);
                }}
                placeholder="Type what you see in the image..."
                className="text-lg p-4"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && userAnswer.trim()) {
                    handleAnswer();
                  }
                }}
              />
              <p className="text-xs text-gray-500">
                Tip: All characters are allowed. Use the display keyboard below or type directly.
              </p>
            </div>

            <DisplayKeyboard />

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleAnswer}
                disabled={!userAnswer.trim() || submitLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {submitLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Submit Answer
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
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}