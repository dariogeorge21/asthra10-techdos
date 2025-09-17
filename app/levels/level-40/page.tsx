/**
 * LEVEL-40 TYPING TEST CHALLENGE - FINAL BOSS LEVEL
 *
 * OVERVIEW:
 * Level-40 represents the final boss challenge of the TechDOS quiz game, featuring
 * a typing test game where players must type random words/sentences within a 30-second
 * time limit with real-time character validation and WPM calculation.
 *
 * GAME MECHANICS:
 * - Duration: Exactly 30 seconds
 * - Content: Random strings of words/sentences for user to type
 * - Real-time Tracking: Highlight correct (green) and incorrect (red) characters
 * - Auto-advance: Move to next word when spacebar is pressed
 * - Single Play: Game can only be played once per session
 *
 * SCORING SYSTEM:
 * - Formula: WPM = (Correct characters ÷ 5) ÷ (time elapsed in minutes)
 * - Live Updates: Display real-time WPM calculation during gameplay
 * - Timer: Show countdown of remaining time
 *
 * USER FLOW:
 * 1. Modal displays rules → User clicks "Start Game"
 * 2. Game begins when user types first character
 * 3. Real-time gameplay with live WPM and timer updates
 * 4. At 30 seconds: Game ends automatically
 * 5. Final score display with "END GAME" button
 * 6. No restart option - single play only
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Timer, CheckCircle, Target, Keyboard as KeyboardIcon, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Team, getGameTimeRemaining, formatTimeRemaining, getGameTimerStatus } from "@/lib/supabase";
import RulesModal from "./RulesModal";

// Typing test content - random words and sentences
// Typing content pool - expanded to ensure users have enough content for 30 seconds
const TYPING_CONTENT = [
  "The quick brown fox jumps over the lazy dog. This pangram contains all letters of the English alphabet. Programming is the art of telling a computer what to do through a series of instructions.",
  "Technology continues to evolve at a rapid pace, transforming how we live, work, and interact with the world around us. Innovation drives progress in fields ranging from artificial intelligence to renewable energy.",
  "Effective problem-solving requires analytical thinking, creativity, and persistence. Breaking complex challenges into smaller, manageable components often leads to elegant solutions that might otherwise remain undiscovered.",
  "The internet has revolutionized communication, enabling instant connections across vast distances. What once took days or weeks to transmit can now be shared globally in mere seconds, fundamentally changing society.",
  "Artificial intelligence systems learn from data patterns to make predictions and decisions. Machine learning algorithms improve over time as they process more information, allowing them to tackle increasingly complex tasks.",
  "Cloud computing provides scalable resources on demand, eliminating the need for extensive physical infrastructure. This model allows businesses to adjust capacity based on current needs rather than projected maximums.",
  "Cybersecurity involves protecting systems, networks, and programs from digital attacks. These attacks often aim to access, change, or destroy sensitive information, extort money, or interrupt normal business processes.",
  "Software development is a collaborative process involving designing, coding, testing, and maintaining applications. Modern methodologies emphasize iterative approaches with frequent feedback to ensure quality outcomes.",
  "Data visualization transforms complex information into accessible graphical formats. Well-designed charts and graphs allow users to quickly grasp trends, outliers, and patterns that might be difficult to discern from raw numbers.",
  "Virtual reality creates immersive digital environments that simulate physical presence. Augmented reality enhances real-world settings by overlaying digital elements, blending the physical and virtual realms seamlessly."
];

interface TypingStats {
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  wpm: number;
  accuracy: number;
  startTime: number | null;
}

interface GameState {
  isStarted: boolean;
  isCompleted: boolean;
  timeRemaining: number;
  currentText: string;
  userInput: string;
  currentWordIndex: number;
  currentTextIndex: number;
  hasStartedTyping: boolean;
  stats: TypingStats;
}

export default function Level40Page() {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRules, setShowRules] = useState(true);
  const [gameState, setGameState] = useState<GameState>({
    isStarted: false,
    isCompleted: false,
    timeRemaining: 30,
    currentText: "",
    userInput: "",
    currentWordIndex: 0,
    currentTextIndex: 0,
    hasStartedTyping: false,
    stats: {
      correctChars: 0,
      incorrectChars: 0,
      totalChars: 0,
      wpm: 0,
      accuracy: 0,
      startTime: null
    }
  });

  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [timerStatus, setTimerStatus] = useState<'not_started' | 'active' | 'expired'>('not_started');
  const [isCompleted, setIsCompleted] = useState(false);

  const [gameHasBeenPlayed, setGameHasBeenPlayed] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Check if game has been played before
  useEffect(() => {
    const hasPlayed = localStorage.getItem('level40_game_played');
    if (hasPlayed === 'true') {
      setGameHasBeenPlayed(true);
      setGameState(prev => ({ ...prev, isCompleted: true }));
    }
  }, []);

  const fetchTeamData = useCallback(async (teamCode: string) => {
    try {
      const response = await fetch(`/api/teams/${teamCode}`);
      if (response.ok) {
        const teamData = await response.json();
        setTeam(teamData);
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

  useEffect(() => {
    const teamCode = localStorage.getItem('team_code');
    if (!teamCode) {
      toast.error("No team code found. Please start from the home page.");
      router.push('/');
      return;
    }

    fetchTeamData(teamCode);

    // Show modal on first load unless user previously dismissed it
    const rulesSeen = localStorage.getItem('level40_rules_shown');
    if (rulesSeen) {
      setShowRules(false);
    } else {
      setShowRules(true);
    }

    // Prevent page reload/navigation
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
      }
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

  // Initialize typing content
  const initializeGame = () => {
    const randomText = TYPING_CONTENT[Math.floor(Math.random() * TYPING_CONTENT.length)];
    setGameState(prev => ({
      ...prev,
      currentText: randomText,
      userInput: "",
      currentWordIndex: 0,
      currentTextIndex: 0,
      isStarted: false,
      isCompleted: false,
      hasStartedTyping: false,
      timeRemaining: 30,
      stats: {
        correctChars: 0,
        incorrectChars: 0,
        totalChars: 0,
        wpm: 0,
        accuracy: 0,
        startTime: null
      }
    }));
  };

  // Start the typing test
  const startGame = () => {
    if (gameHasBeenPlayed) {
      toast.error("This game can only be played once per session!");
      return;
    }

    setGameState(prev => ({ ...prev, isStarted: true }));
    
    // We'll start the timer when the user types their first character
    // Focus input immediately
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // End the typing test
  const endGame = () => {
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }

    // Calculate final WPM based on the actual time elapsed
    const timeElapsed = gameState.stats.startTime 
      ? Math.min(30, (Date.now() - gameState.stats.startTime) / 1000 / 60)  // cap at 30 seconds (0.5 minutes)
      : 0.5;  // fallback to 30 seconds if startTime is missing
    
    const finalWPM = Math.round((gameState.stats.correctChars / 5) / timeElapsed);

    setGameState(prev => ({ 
      ...prev, 
      isCompleted: true,
      stats: {
        ...prev.stats,
        wpm: finalWPM
      }
    }));

    localStorage.setItem('level40_game_played', 'true');
    setGameHasBeenPlayed(true);
  };

  // Handle typing input
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!gameState.isStarted || gameState.isCompleted) return;

    const value = e.target.value;
    const currentChar = gameState.currentText[value.length - 1];
    const typedChar = value[value.length - 1];

    // Start timer on first keystroke
    if (!gameState.hasStartedTyping) {
      const now = Date.now();
      setGameState(prev => ({
        ...prev,
        hasStartedTyping: true,
        stats: { ...prev.stats, startTime: now }
      }));

      // Start 30-second countdown
      gameTimerRef.current = setInterval(() => {
        setGameState(prev => {
          const newTimeRemaining = prev.timeRemaining - 1;

          if (newTimeRemaining <= 0) {
            if (gameTimerRef.current) {
              clearInterval(gameTimerRef.current);
              gameTimerRef.current = null;
            }
            return { 
              ...prev, 
              timeRemaining: 0, 
              isCompleted: true 
            };
          }

          // Calculate WPM in real-time based on elapsed time since first keystroke
          const timeElapsed = (Date.now() - (prev.stats.startTime || 0)) / 1000 / 60; // in minutes
          const wpm = timeElapsed > 0 ? Math.round((prev.stats.correctChars / 5) / timeElapsed) : 0;

          return {
            ...prev,
            timeRemaining: newTimeRemaining,
            stats: { ...prev.stats, wpm }
          };
        });
      }, 1000);
    }

    let correctChars = gameState.stats.correctChars;
    let incorrectChars = gameState.stats.incorrectChars;

    // Check if the last typed character is correct
    if (value.length > gameState.userInput.length) {
      // Character was added
      if (typedChar === currentChar) {
        correctChars++;
      } else {
        incorrectChars++;
      }
    } else if (value.length < gameState.userInput.length) {
      // Character was deleted
      const deletedChar = gameState.userInput[value.length];
      const expectedChar = gameState.currentText[value.length];
      if (deletedChar === expectedChar) {
        correctChars = Math.max(0, correctChars - 1);
      } else {
        incorrectChars = Math.max(0, incorrectChars - 1);
      }
    }

    const totalChars = correctChars + incorrectChars;
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;

          // If user has reached the end of current text, load the next one
    if (value.length >= gameState.currentText.length - 1) {
      // Move to next text in the pool
      const nextTextIndex = (gameState.currentTextIndex + 1) % TYPING_CONTENT.length;
      const nextText = TYPING_CONTENT[nextTextIndex];
      
      setGameState(prev => ({
        ...prev,
        currentText: nextText,
        userInput: "",
        currentTextIndex: nextTextIndex,
        currentWordIndex: 0,
        stats: {
          ...prev.stats,
          correctChars,
          incorrectChars,
          totalChars,
          accuracy
        }
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        userInput: value,
        stats: {
          ...prev.stats,
          correctChars,
          incorrectChars,
          totalChars,
          accuracy
        }
      }));
    }
  };

  // Render character with styling
  const renderTextWithHighlight = () => {
    const text = gameState.currentText;
    const input = gameState.userInput;

    return text.split('').map((char, index) => {
      let className = "text-gray-400";

      if (index < input.length) {
        // Character has been typed
        if (input[index] === char) {
          className = "text-green-600 bg-green-100"; // Correct
        } else {
          className = "text-red-600 bg-red-100"; // Incorrect
        }
      } else if (index === input.length) {
        className = "text-gray-800 bg-blue-200 animate-pulse"; // Current character
      }

      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  // Initialize game on component mount
  useEffect(() => {
    if (!gameHasBeenPlayed) {
      initializeGame();
    }
  }, [gameHasBeenPlayed]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Level 40...</p>
        </div>
      </div>
    );
  }

  if (timerStatus === 'expired') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-2xl text-red-600">Game Time Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              The overall game time has expired. You can no longer play levels.
            </p>
            <Button onClick={() => router.push('/levels')} className="bg-purple-600 hover:bg-purple-700">
              Return to Levels
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate final score
  const calculateScore = () => {
    // Use the WPM that was calculated in real-time during the game
    // This ensures we're using the accurate measurement based on actual typing time
    
    const baseScore = gameState.stats.correctChars * 50; // 50 points per correct character
    const accuracyBonus = gameState.stats.accuracy >= 90 ? 1000 : gameState.stats.accuracy >= 80 ? 500 : 0;
    const wpmBonus = gameState.stats.wpm >= 60 ? 1500 : gameState.stats.wpm >= 40 ? 1000 : gameState.stats.wpm >= 20 ? 500 : 0;

    const totalScore = baseScore + accuracyBonus + wpmBonus;

    return {
      totalScore,
      baseScore,
      accuracyBonus,
      wpmBonus,
      wpm: gameState.stats.wpm,
      accuracy: gameState.stats.accuracy,
      correctChars: gameState.stats.correctChars,
      incorrectChars: gameState.stats.incorrectChars
    };
  };

  const completeLevel = async () => {
    if (!team) return;

    const teamCode = localStorage.getItem('team_code');
    if (!teamCode) return;

    const scoreData = calculateScore();
    const newTotalScore = team.score + scoreData.totalScore;
    const newLevel = 41; // This is the final level

    try {
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
      toast.success("Congratulations! You've completed the final level!");
    } catch (error) {
      console.error('Error completing level:', error);
      toast.error("Failed to save progress. Please try again.");
    }
  };

  // Game completion screen
  if (gameState.isCompleted && !isCompleted) {
    const scoreData = calculateScore();

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <Trophy className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-yellow-700">Final Boss Challenge Complete! 🏆</CardTitle>
            <div className="mt-2">
              <Badge variant="outline" className="text-lg px-4 py-2 bg-yellow-50 text-yellow-700 border-yellow-200">
                Typing Test Master
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Performance Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-600 font-medium mb-1">WPM</div>
                <div className="text-3xl font-bold text-blue-600">{scoreData.wpm}</div>
                <div className="text-xs text-blue-500 mt-1">Words Per Minute</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-green-600 font-medium mb-1">Accuracy</div>
                <div className="text-3xl font-bold text-green-600">{scoreData.accuracy}%</div>
                <div className="text-xs text-green-500 mt-1">Typing Precision</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-sm text-purple-600 font-medium mb-1">Characters</div>
                <div className="text-3xl font-bold text-purple-600">{scoreData.correctChars}</div>
                <div className="text-xs text-purple-500 mt-1">Correctly Typed</div>
              </div>
            </div>
            
            {/* Score Breakdown */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 text-gray-800">Score Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Base Score ({scoreData.correctChars} correct chars × 50)</span>
                  <span className="font-medium">{scoreData.baseScore}</span>
                </div>
                <div className="flex justify-between">
                  <span>Accuracy Bonus ({scoreData.accuracy}% accuracy)</span>
                  <span className="font-medium">+{scoreData.accuracyBonus}</span>
                </div>
                <div className="flex justify-between">
                  <span>WPM Bonus ({scoreData.wpm} WPM)</span>
                  <span className="font-medium">+{scoreData.wpmBonus}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total Score</span>
                  <span>{scoreData.totalScore}</span>
                </div>
              </div>
            </div>
            
            {/* Action Button */}
            <Button 
              onClick={completeLevel} 
              className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white py-6 text-lg font-bold"
            >
              END GAME
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Final completion screen (after END GAME is clicked)
  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <div className="mx-auto mb-4 w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-4xl font-bold text-green-700">🎉 GAME COMPLETE! 🎉</CardTitle>
            <p className="text-lg text-gray-600 mt-4">
              Congratulations! You have successfully completed all 40 levels of TechDOS!
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center p-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                <h3 className="text-xl font-bold text-purple-700 mb-2">Final Achievement Unlocked</h3>
                <Badge className="text-lg px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  TechDOS Master Champion
                </Badge>
              </div>

              <Button
                onClick={() => router.push('/levels')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 text-lg"
              >
                View Final Results
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main game interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Rules Modal */}
      <RulesModal
        open={showRules}
        onClose={() => setShowRules(false)}
        onStartGame={() => {
          setShowRules(false);
          if (!gameHasBeenPlayed) {
            startGame();
          }
        }}
      />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 rounded-full p-3">
                <KeyboardIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Level 40 - Final Boss Challenge</h1>
                <p className="text-gray-600">Typing Test Master</p>
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
        {gameHasBeenPlayed ? (
          // Game already played message
          <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-700">Game Already Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                You have already completed the Final Boss Challenge. This game can only be played once per session.
              </p>
              <Button
                onClick={() => router.push('/levels')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Return to Levels
              </Button>
            </CardContent>
          </Card>
        ) : !gameState.isStarted ? (
          // Pre-game state
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Target className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-red-700">Final Boss Challenge</CardTitle>
              <p className="text-gray-600 mt-2">
                The ultimate typing test - 30 seconds to prove your skills!
              </p>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Ready to Begin?</h3>
                <p className="text-gray-600 mb-4">
                  Click "Start Challenge" to begin the 30-second typing test.
                  Remember: This can only be played once!
                </p>
                <Button
                  onClick={startGame}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-3 text-lg"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Start Challenge
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Active game state
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Game Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              {/* Timer */}
              <div className="flex flex-col items-center bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-red-600 font-medium mb-1">Time Remaining</div>
                <div className="text-3xl font-bold text-red-600">
                  {gameState.timeRemaining}s
                </div>
              </div>
              
              {/* WPM */}
              <div className="flex flex-col items-center bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium mb-1">WPM</div>
                <div className="text-3xl font-bold text-blue-600">{gameState.stats.wpm}</div>
              </div>
              
              {/* Accuracy */}
              <div className="flex flex-col items-center bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium mb-1">Accuracy</div>
                <div className="text-3xl font-bold text-green-600">{gameState.stats.accuracy}%</div>
              </div>
            </div>

            {/* Typing Area */}
            <Card className="p-8">
              <div className="space-y-6">
                {/* Text Display */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="text-2xl leading-relaxed font-mono tracking-wide">
                    {renderTextWithHighlight()}
                  </div>
                </div>

                {/* Input Field */}
                <div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={gameState.userInput}
                    onChange={handleTyping}
                    className="w-full p-4 text-xl border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none font-mono"
                    placeholder="Start typing here..."
                    disabled={gameState.isCompleted}
                  />
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Progress</span>
                    <span>{gameState.userInput.length} / {gameState.currentText.length} characters</span>
                  </div>
                  <Progress
                    value={(gameState.userInput.length / gameState.currentText.length) * 100}
                    className="h-2"
                  />
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}