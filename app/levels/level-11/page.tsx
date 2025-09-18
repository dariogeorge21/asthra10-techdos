/**
 * LEVEL-11 WORD UNSCRAMBLING IMPLEMENTATION - TECHDOS GAME
 *
 * OVERVIEW:
 * Level-11 represents a word unscrambling challenge in the TechDOS quiz game, featuring
 * misspelled/scrambled words that players need to correct by typing the proper spelling
 * using a display keyboard interface with text input validation.
 *
 * PUZZLE MECHANICS:
 * - Format: Scrambled/misspelled words with text input answers
 * - Total Questions: 20 diverse word puzzles covering technology terms
 * - Input Method: Display keyboard with text input field (letters only, no numbers)
 * - Answer Validation: Lowercase conversion, letters only, exact match required
 * - No Hint System: Players must solve without hints to increase difficulty
 * - Timer Integration: Real-time countdown with global game timer
 * - Navigation Protection: Prevents accidental page refresh/navigation during quiz
 *
 * GAME FLOW:
 * 1. Word Display: Scrambled words are presented sequentially
 * 2. Answer Input: Players type correct spelling using display keyboard or regular keyboard
 * 3. Answer Validation: Input is converted to lowercase and validated (letters only)
 * 4. Answer Submission: Submit typed answer or skip to next word
 * 5. Progress Tracking: Visual progress bar and word counter
 * 6. Level Completion: Automatic progression after all words answered/skipped
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Timer, SkipForward, ArrowRight, CheckCircle, Target, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Team, getGameTimeRemaining, formatTimeRemaining, getGameTimerStatus } from "@/lib/supabase";

interface WordPuzzle {
  id: number;
  scrambledWord: string;
  correctWord: string;
  category: string;
}

/**
 * LEVEL-11 WORD PUZZLE BANK
 * 20 scrambled/misspelled technology-related words
 */
const puzzles: WordPuzzle[] = [
  {
    id: 1,
    scrambledWord: "PTALOP",
    correctWord: "laptop",
    category: "Technology"
  },
  {
    id: 2,
    scrambledWord: "EPNHO",
    correctWord: "phone",
    category: "Technology"
  },
  {
    id: 3,
    scrambledWord: "EOGLOG",
    correctWord: "google",
    category: "Technology"
  },
  {
    id: 4,
    scrambledWord: "NERTNITE",
    correctWord: "internet",
    category: "Technology"
  },
  {
    id: 5,
    scrambledWord: "CFAKOBOE",
    correctWord: "facebook",
    category: "Technology"
  },
  {
    id: 6,
    scrambledWord: "OZAMNA",
    correctWord: "amazon",
    category: "Technology"
  },
  {
    id: 7,
    scrambledWord: "SPWAHATT",
    correctWord: "whatsapp",
    category: "Technology"
  },
  {
    id: 8,
    scrambledWord: "TUBOYUE",
    correctWord: "youtube",
    category: "Technology"
  },
  {
    id: 9,
    scrambledWord: "MOEYMR",
    correctWord: "memory",
    category: "Technology"
  },
  {
    id: 10,
    scrambledWord: "ACMENI",
    correctWord: "cinema",
    category: "Technology"
  }
];

export default function Level11Page() {
  const [team, setTeam] = useState<Team | null>(null);
  const [initialTeamStats, setInitialTeamStats] = useState<{
    correct_questions: number;
    incorrect_questions: number;
    skipped_questions: number;
    hint_count: number;
  } | null>(null);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [levelStartTime] = useState<Date>(new Date());
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [timerStatus, setTimerStatus] = useState<'not_started' | 'active' | 'expired'>('not_started');
  const [loading, setLoading] = useState(true);
  const [skipLoading, setSkipLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
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

      if (teamData.current_level > 11) {
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

  const validateAnswer = (input: string, correctAnswer: string): boolean => {
    const normalizedInput = input.toLowerCase().trim().replace(/[^a-z]/g, '');
    const normalizedCorrect = correctAnswer.toLowerCase().trim();
    return normalizedInput === normalizedCorrect;
  };

  const handleAnswer = async () => {
    if (submitLoading || !userAnswer.trim()) {
      return;
    }

    setSubmitLoading(true);

    try {
      const currentPuzzle = puzzles[currentPuzzleIndex];
      const isCorrect = validateAnswer(userAnswer, currentPuzzle.correctWord);
      
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

      if (currentPuzzleIndex < puzzles.length - 1) {
        setCurrentPuzzleIndex(currentPuzzleIndex + 1);
        setUserAnswer("");
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
        skipped_questions: team.skipped_questions + 1
      };

      await updateTeamStats(updatedStats);

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
    if (accuracy >= 90 && timeTaken < 3) performanceRating = "Excellent";
    else if (accuracy >= 70 && timeTaken < 4) performanceRating = "Good";
    else if (accuracy >= 50 && timeTaken < 5) performanceRating = "Average";

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
    const newLevel = 12;

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

  const DisplayKeyboard = () => {
    const keys = [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
      ['space', 'backspace']
    ];

    const handleKeyPress = (key: string) => {
      const currentPuzzle = puzzles[currentPuzzleIndex];
      
      if (key === 'backspace') {
        setUserAnswer(prev => prev.slice(0, -1));
        return;
      }
      
      let newValue = userAnswer;
      if (key === 'space') {
        newValue = userAnswer + ' ';
      } else {
        newValue = userAnswer + key;
      }
      
      // Apply the same validation logic as the input field
      const expectedWords = currentPuzzle.correctWord.trim().split(/\s+/);
      if (expectedWords.length === 1 && newValue.includes(' ')) {
        return; // Don't allow spaces for one-word answers
      }
      
      // Only allow letters and spaces
      const cleanValue = newValue.replace(/[^aA-zZ\s]/g, '');
      
      // Check maximum length
      if (cleanValue.length > currentPuzzle.correctWord.length) {
        toast.error("Maximum length reached");
        return;
      }
      
      // Check character frequency limits
      const targetChars = currentPuzzle.correctWord.toLowerCase();
      
      // Count character frequencies in target
      const targetFreq: { [key: string]: number } = {};
      for (const char of targetChars) {
        targetFreq[char] = (targetFreq[char] || 0) + 1;
      }
      
      // Validate character by character
      let validInput = '';
      const usedFreq: { [key: string]: number } = {};
      
      for (const char of cleanValue) {
        const lowerChar = char.toLowerCase();
        usedFreq[lowerChar] = (usedFreq[lowerChar] || 0) + 1;
        
        // Allow the character if it doesn't exceed the target frequency
        if (targetFreq[lowerChar] && usedFreq[lowerChar] <= targetFreq[lowerChar]) {
          validInput += char;
        } else {
          // Reset the frequency count for this character since we're not adding it
          usedFreq[lowerChar]--;
        }
      }
      
      setUserAnswer(validInput);
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading Level 11...</p>
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
            <CardTitle className="text-3xl font-bold text-green-700">Level 11 Complete! 🎉</CardTitle>
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
                  <span className="font-semibold text-green-600">+{scoreData.baseScore}</span>
                </div>
                {scoreData.consecutiveBonus > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Consecutive Correct Bonus</span>
                    <span className="font-semibold text-blue-600">+{scoreData.consecutiveBonus}</span>
                  </div>
                )}
                {scoreData.timeBonus > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Speed Bonus</span>
                    <span className="font-semibold text-yellow-600">+{scoreData.timeBonus}</span>
                  </div>
                )}
                {scoreData.penalties > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Penalties (Wrong/Skipped)</span>
                    <span className="font-semibold text-red-600">-{scoreData.penalties}</span>
                  </div>
                )}
                <hr className="border-gray-300" />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-purple-700">Total Level Score</span>
                  <span className="text-purple-700">+{scoreData.totalScore}</span>
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

  const currentPuzzle = puzzles[currentPuzzleIndex];
  const progress = ((currentPuzzleIndex + 1) / puzzles.length) * 100;
  const timerDisplay = getTimerDisplay();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Trophy className="h-6 w-6 text-purple-600" />
                <h1 className="text-2xl font-bold text-purple-800">Level 11 - Word Unscrambling</h1>
              </div>
              <Badge variant="outline" className="text-purple-700 border-purple-300">
                {currentPuzzleIndex + 1} of {puzzles.length}
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
            Progress: {currentPuzzleIndex + 1}/{puzzles.length} words completed
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-4 tracking-wider">
                {currentPuzzle.scrambledWord}
              </div>
              <div className="text-lg text-gray-700">
                Unscramble this word to find the correct spelling
              </div>
              <Badge variant="secondary" className="mt-2">
                Category: {currentPuzzle.category}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Your Answer:</label>
              <Input
                value={userAnswer}
                onChange={(e) => {
                  const currentPuzzle = puzzles[currentPuzzleIndex];
                  const newValue = e.target.value;
                  
                  // Check if answer is one word and prevent spaces
                  const expectedWords = currentPuzzle.correctWord.trim().split(/\s+/);
                  if (expectedWords.length === 1 && newValue.includes(' ')) {
                    return; // Don't allow spaces for one-word answers
                  }
                  
                  // Only allow letters and spaces
                  const cleanValue = newValue.replace(/[^a-zA-Z\s]/g, '');
                  
                  // Check maximum length
                  if (cleanValue.length > currentPuzzle.correctWord.length) {
                    toast.error("Maximum length reached");
                    return;
                  }
                  
                  // Check character frequency limits
                  const targetChars = currentPuzzle.correctWord.toLowerCase();
                  
                  // Count character frequencies in target
                  const targetFreq: { [key: string]: number } = {};
                  for (const char of targetChars) {
                    targetFreq[char] = (targetFreq[char] || 0) + 1;
                  }
                  
                  // Validate character by character
                  let validInput = '';
                  const usedFreq: { [key: string]: number } = {};
                  
                  for (const char of cleanValue) {
                    const lowerChar = char.toLowerCase();
                    usedFreq[lowerChar] = (usedFreq[lowerChar] || 0) + 1;
                    
                    // Allow the character if it doesn't exceed the target frequency
                    if (targetFreq[lowerChar] && usedFreq[lowerChar] <= targetFreq[lowerChar]) {
                      validInput += char;
                    } else {
                      // Reset the frequency count for this character since we're not adding it
                      usedFreq[lowerChar]--;
                    }
                  }
                  
                  setUserAnswer(validInput);
                }}
                placeholder="Type the correct spelling here..."
                className="text-lg p-4"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && userAnswer.trim()) {
                    handleAnswer();
                  }
                }}
              />
              <p className="text-xs text-gray-500">
                Tip: Only letters are allowed. Use the display keyboard below or type directly. Press Enter to submit.
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