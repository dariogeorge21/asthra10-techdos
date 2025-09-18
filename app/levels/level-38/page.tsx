"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Timer, Grid3X3, CheckCircle, Lightbulb, Hash, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Team, getGameTimeRemaining, formatTimeRemaining, getGameTimerStatus } from "@/lib/supabase";
import RulesModal from "./RulesModal";
import SudokuGrid from "./SudokuGrid";

// Sudoku puzzle data - 0 represents empty cells
const INITIAL_PUZZLE = [
  [0, 7, 0, 5, 8, 3, 0, 2, 0],
  [0, 5, 9, 2, 0, 0, 3, 0, 0],
  [3, 4, 0, 0, 0, 6, 5, 0, 7],
  [7, 9, 5, 0, 0, 0, 6, 3, 2],
  [0, 0, 3, 6, 9, 7, 1, 0, 0],
  [6, 8, 0, 0, 0, 2, 7, 0, 0],
  [9, 1, 4, 8, 3, 5, 0, 7, 6],
  [0, 3, 0, 7, 0, 1, 4, 9, 5],
  [5, 6, 7, 4, 2, 9, 0, 1, 3]
];

// Solution for validation
const SOLUTION = [
  [1, 7, 6, 5, 8, 3, 9, 2, 4],
  [8, 5, 9, 2, 7, 4, 3, 6, 1],
  [3, 4, 2, 9, 1, 6, 5, 8, 7],
  [7, 9, 5, 1, 4, 8, 6, 3, 2],
  [4, 2, 3, 6, 9, 7, 1, 5, 8],
  [6, 8, 1, 3, 5, 2, 7, 4, 9],
  [9, 1, 4, 8, 3, 5, 2, 7, 6],
  [2, 3, 8, 7, 6, 1, 4, 9, 5],
  [5, 6, 7, 4, 2, 9, 8, 1, 3]
];

interface GameState {
  grid: number[][];
  selectedCell: { row: number; col: number } | null;
  conflicts: boolean[][];
  isCompleted: boolean;
  startTime: number | null;
  endTime: number | null;
  moves: number;
  hintsUsed: number;
}

export default function Level38Page() {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRules, setShowRules] = useState(true);
  const [gameState, setGameState] = useState<GameState>({
    grid: INITIAL_PUZZLE.map(row => [...row]),
    selectedCell: null,
    conflicts: Array(9).fill(null).map(() => Array(9).fill(false)),
    isCompleted: false,
    startTime: null,
    endTime: null,
    moves: 0,
    hintsUsed: 0
  });
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [timerStatus, setTimerStatus] = useState<'not_started' | 'active' | 'expired'>('not_started');
  const [isLevelCompleted, setIsLevelCompleted] = useState(false);
  const [levelStats, setLevelStats] = useState({
    correct: 0,
    incorrect: 0,
    skipped: 0,
    // hintsUsed: 0
  });
  const [completionScoreData, setCompletionScoreData] = useState<{
    totalScore: number;
    baseScore: number;
    timeBonus: number;
    consecutiveBonus: number;
    penalties: number;
    timeTaken: number; // minutes
    accuracy: number;
    performanceRating: string;
  } | null>(null);
  const [flashState, setFlashState] = useState<'correct' | 'incorrect' | null>(null);
  const [, setAnswer] = useState("");

  const router = useRouter();

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
          router.push('/levels');
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [team, timerStatus]);

  // Check if a number placement is valid
  const isValidPlacement = (grid: number[][], row: number, col: number, num: number): boolean => {
    // Check row
    for (let c = 0; c < 9; c++) {
      if (c !== col && grid[row][c] === num) return false;
    }

    // Check column
    for (let r = 0; r < 9; r++) {
      if (r !== row && grid[r][col] === num) return false;
    }

    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if ((r !== row || c !== col) && grid[r][c] === num) return false;
      }
    }

    return true;
  };

  // Find conflicts in the grid
  const findConflicts = (grid: number[][]): boolean[][] => {
    const conflicts = Array(9).fill(null).map(() => Array(9).fill(false));

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const num = grid[row][col];
        if (num !== 0 && !isValidPlacement(grid, row, col, num)) {
          conflicts[row][col] = true;
        }
      }
    }

    return conflicts;
  };

  // Check if puzzle is complete
  const isPuzzleComplete = (grid: number[][]): boolean => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) return false;
      }
    }
    return true;
  };

  // Handle cell selection
  const handleCellSelect = (row: number, col: number) => {
    // Only allow selection of empty cells or user-filled cells
    if (INITIAL_PUZZLE[row][col] === 0) {
      setGameState(prev => ({
        ...prev,
        selectedCell: { row, col }
      }));
    }
  };

  // Handle number input
  const handleNumberInput = (num: number) => {
    if (!gameState.selectedCell) return;

    const { row, col } = gameState.selectedCell;
    
    // Can't modify pre-filled cells
    if (INITIAL_PUZZLE[row][col] !== 0) return;

    // Start timer on first move
    if (!gameState.startTime) {
      setGameState(prev => ({ ...prev, startTime: Date.now() }));
    }

    const newGrid = gameState.grid.map(r => [...r]);
    newGrid[row][col] = num;

    const newConflicts = findConflicts(newGrid);
    const isComplete = isPuzzleComplete(newGrid) && newConflicts.every(row => row.every(cell => !cell));

    setGameState(prev => ({
      ...prev,
      grid: newGrid,
      conflicts: newConflicts,
      isCompleted: isComplete,
      moves: prev.moves + 1
    }));
  };

  // Clear selected cell
  const handleClearCell = () => {
    if (!gameState.selectedCell) return;

    const { row, col } = gameState.selectedCell;
    
    // Can't modify pre-filled cells
    if (INITIAL_PUZZLE[row][col] !== 0) return;

    const newGrid = gameState.grid.map(r => [...r]);
    newGrid[row][col] = 0;

    const newConflicts = findConflicts(newGrid);

    setGameState(prev => ({
      ...prev,
      grid: newGrid,
      conflicts: newConflicts,
      moves: prev.moves + 1
    }));
  };

  // Provide hint
  const handleHint = () => {
    if (!gameState.selectedCell) {
      toast.error("Please select a cell first!");
      return;
    }

    const { row, col } = gameState.selectedCell;
    
    // Can't provide hint for pre-filled cells
    if (INITIAL_PUZZLE[row][col] !== 0) {
      toast.error("This cell is already filled!");
      return;
    }

    const correctNumber = SOLUTION[row][col];
    handleNumberInput(correctNumber);

    setGameState(prev => ({
      ...prev,
      hintsUsed: prev.hintsUsed + 1
    }));

    // toast.success(`Hint: The correct number is ${correctNumber}`);
  };

  // Submit puzzle for validation
  const handleSubmit = () => {
    if (!isPuzzleComplete(gameState.grid)) {
      toast.error("Oops! Please fill all the boxes to complete this Sudoku challenge!");
      return;
    }

    const conflicts = findConflicts(gameState.grid);
    const hasConflicts = conflicts.some(row => row.some(cell => cell));

    if (hasConflicts) {
      toast.error("There are conflicts in your solution. Please check the highlighted cells.");
      return;
    }

    // Check against solution
    const isCorrect = gameState.grid.every((row, r) =>
      row.every((cell, c) => cell === SOLUTION[r][c])
    );

    if (isCorrect) {
      completeLevel();
    } else {
      toast.error("The solution is not correct. Please review your answers.");
    }
  };

  // Skip level with penalty
  const handleSkip = async () => {
    if (!team) return;

    const teamCode = localStorage.getItem('team_code');
    if (!teamCode) return;

    // Apply 50% score penalty for skipping
    const penaltyScore = Math.floor(team.score * 0.5);
    const newTotalScore = Math.max(0, team.score - penaltyScore);
    const newLevel = Math.max(team.current_level, 39);

    try {
      const response = await fetch(`/api/teams/${teamCode}/score`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: newTotalScore,
          current_level: newLevel
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setIsLevelCompleted(true);
      toast.warning(`Level skipped! 50% score penalty applied (-${penaltyScore} points)`);
    } catch (error) {
      console.error('Error skipping level:', error);
      toast.error("Failed to skip level. Please try again.");
    }
  };

  const completeLevel = async () => {
    if (!team || !gameState.startTime) return;

    const teamCode = localStorage.getItem('team_code');
    if (!teamCode) return;

    // Calculate score
      const timeElapsedSeconds = (Date.now() - gameState.startTime) / 1000; // seconds
      const baseScore = 1000;
      const timeBonus = Math.max(0, 500 - Math.floor(timeElapsedSeconds / 60) * 50);
      const hintPenalty = gameState.hintsUsed * 100;
      const movesPenalty = Math.max(0, (gameState.moves - 50) * 5);

      const finalScore = Math.max(100, baseScore + timeBonus - hintPenalty - movesPenalty);

      // Prepare score data for display
      const scoreData = {
        totalScore: finalScore,
        baseScore,
        timeBonus,
        consecutiveBonus: 0,
        penalties: hintPenalty + movesPenalty,
        timeTaken: timeElapsedSeconds / 60, // minutes
        accuracy: 100, // Sudoku full completion
        performanceRating: finalScore >= 1400 ? 'Excellent' : finalScore >= 1200 ? 'Great' : finalScore >= 1000 ? 'Good' : 'Needs Improvement'
      };

      // Store the calculated score data for consistent display
      setCompletionScoreData(scoreData);

      const newTotalScore = team.score + scoreData.totalScore;
      const newLevel = Math.max(team.current_level, 39);

      try {
        const response = await fetch(`/api/teams/${teamCode}/score`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            score: newTotalScore,
            current_level: newLevel
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setIsLevelCompleted(true);
        setGameState(prev => ({
          ...prev,
          isCompleted: true,
          endTime: Date.now() // Freeze the end time
        }));
        toast.success("Level 38 completed! Excellent Sudoku skills!");
      } catch (error) {
        console.error('Error completing level:', error);
        toast.error("Failed to save progress. Please try again.");
      }
    };

    // Fallback while final score is being prepared
    if (isLevelCompleted && !completionScoreData) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-gray-600">Calculating final score...</p>
          </div>
        </div>
      );
    }

  if (isLevelCompleted) {
    // Use stored score data calculated at completion
    const scoreData = completionScoreData as NonNullable<typeof completionScoreData>;
    // Compute frozen elapsed time (seconds) using stored start and end times if available
    const frozenTimeSeconds = (gameState.startTime && gameState.endTime)
      ? Math.max(0, Math.floor((gameState.endTime - gameState.startTime) / 1000))
      : Math.max(0, Math.floor((scoreData.timeTaken || 0) * 60));
    const frozenMinutes = Math.floor(frozenTimeSeconds / 60);
    const frozenSeconds = String(frozenTimeSeconds % 60).padStart(2, '0');

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-700">Sudoku Master! 🧩</CardTitle>
            <div className="mt-2">
              <Badge variant="outline" className="text-lg px-4 py-2 bg-green-50 text-green-700 border-green-200">
                Level 38 Complete
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Performance Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-600 font-medium mb-1">Time</div>
                <div className="text-2xl font-bold text-blue-600">{frozenMinutes}:{frozenSeconds}</div>
                <div className="text-xs text-blue-500 mt-1">Minutes:Seconds</div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-sm text-purple-600 font-medium mb-1">Moves</div>
                <div className="text-2xl font-bold text-purple-600">{gameState.moves}</div>
                <div className="text-xs text-purple-500 mt-1">Total Actions</div>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-sm text-orange-600 font-medium mb-1">Hints Used</div>
                <div className="text-2xl font-bold text-orange-600">{gameState.hintsUsed}</div>
                <div className="text-xs text-orange-500 mt-1">Help Requests</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-green-600 font-medium mb-1">Final Score</div>
                <div className="text-2xl font-bold text-green-600">{scoreData.totalScore}</div>
                <div className="text-xs text-green-500 mt-1">Total Points</div>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 text-gray-800">Score Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Base Score (Completion)</span>
                  <span className="font-medium">{scoreData.baseScore}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time Bonus</span>
                  <span className="font-medium">+{scoreData.timeBonus}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hint+Moves Penalties</span>
                  <span className="font-medium">-{scoreData.penalties}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total Score</span>
                  <span>{scoreData.totalScore}</span>
                </div>
              </div>
            </div>

            {/* Performance Feedback */}
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">Performance Feedback</h4>
              <p className="text-sm text-gray-600">
                {scoreData.performanceRating === 'Excellent' &&
                  "Outstanding performance! You demonstrated excellent logic and speed. Keep up the great work!"}
                {scoreData.performanceRating === 'Great' &&
                  "Great job! You showed solid understanding with good accuracy and timing. Well done!"}
                {scoreData.performanceRating === 'Good' &&
                  "Good effort! You're on the right track. Consider reviewing techniques you found challenging."}
                {scoreData.performanceRating === 'Needs Improvement' &&
                  "Keep practicing! Focus on accuracy and try to work more efficiently in future levels."}
              </p>
            </div>

            {/* Action Button */}
            <Button
              onClick={() => router.push('/levels')}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white py-6 text-lg font-bold"
            >
              Continue to Level 39
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Rules Modal */}
      <RulesModal
        open={showRules}
        onClose={() => setShowRules(false)}
      />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-indigo-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-100 rounded-full p-3">
                <Grid3X3 className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Level 38 - Sudoku Challenge</h1>
                <p className="text-gray-600">Solve the 9×9 number puzzle</p>
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
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Game Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-sm text-gray-600 font-medium mb-1">Moves</div>
              <div className="text-2xl font-bold text-indigo-600">{gameState.moves}</div>
            </div>

            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-sm text-gray-600 font-medium mb-1">Hints Used</div>
              <div className="text-2xl font-bold text-orange-600">{gameState.hintsUsed}</div>
            </div>

            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-sm text-gray-600 font-medium mb-1">Time</div>
              <div className="text-2xl font-bold text-green-600">
                {gameState.startTime ?
                  `${Math.floor((Date.now() - gameState.startTime) / 60000)}:${Math.floor(((Date.now() - gameState.startTime) % 60000) / 1000).toString().padStart(2, '0')}`
                  : '0:00'
                }
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Sudoku Grid */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <SudokuGrid
                  grid={gameState.grid}
                  initialGrid={INITIAL_PUZZLE}
                  selectedCell={gameState.selectedCell}
                  conflicts={gameState.conflicts}
                  onCellSelect={handleCellSelect}
                />
              </Card>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              {/* Number Keyboard */}
              <Card className="p-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Hash className="h-5 w-5" />
                    Number Keyboard
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                      <Button
                        key={num}
                        variant="outline"
                        className="h-12 text-lg font-bold border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300"
                        onClick={() => handleNumberInput(num)}
                        disabled={!gameState.selectedCell}
                      >
                        {num}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full h-12 border-red-200 text-red-600 hover:bg-red-50"
                    onClick={handleClearCell}
                    disabled={!gameState.selectedCell}
                  >
                    Clear Cell
                  </Button>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card className="p-4">
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                    onClick={handleHint}
                    disabled={!gameState.selectedCell}
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Get Hint (-100 pts)
                  </Button>

                  <Button
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
                    onClick={handleSubmit}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submit Solution
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                    onClick={handleSkip}
                  >
                    <SkipForward className="h-4 w-4 mr-2" />
                    Skip Level (-50% Score)
                  </Button>
                </CardContent>
              </Card>

              {/* Instructions */}
              <Card className="p-4">
                <CardContent>
                  <h3 className="font-semibold mb-2 text-gray-800">How to Play</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Click an empty cell to select it</li>
                    <li>• Use the number keyboard to fill cells</li>
                    <li>• Each row, column, and 3×3 box must contain digits 1-9</li>
                    <li>• Red cells indicate conflicts</li>
                    <li>• Use hints if you are stuck</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
