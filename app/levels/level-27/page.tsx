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
import RulesModal from "./RulesModal";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: string;
  hint: string;
}

/**
 * LEVEL-19 QUESTION BANK
 *
 * A diverse collection of 20 multiple-choice questions covering:
 * - Astronomy & Science (planets, natural phenomena)
 * - Indian History & Politics (leaders, achievements)
 * - Literature & Arts (authors, awards)
 * - Sports & Entertainment (records, achievements)
 * - Geography & Nature (locations, landmarks)
 * - Pop Culture & Technology (viral content, innovations)
 *
 * Each question includes:
 * - 4 carefully crafted options with plausible distractors
 * - One correct answer
 * - A helpful hint that provides context without giving away the answer
 */
const questions: Question[] = [
    {
        "id": 1,
        "question": "A rich guy gets bored, throws parties for strangers, and dies because no one RSVP’d.",
        "options": [
            "The Great Gatsby",
            "Citizen Kane",
            "Pride and Prejudice",
            "Anna Karenina"
        ],
        "correct": "The Great Gatsby",
        "hint": "Think about 1920s jazz age novels filled with parties and tragedy."
    },
    {
        "id": 2,
        "question": "A man stared at the stars, guessed wrong about circles, but still rewrote the universe.",
        "options": [
            "Claudius Ptolemy",
            "Nicolaus Copernicus",
            "Johannes Kepler",
            "Tycho Brahe"
        ],
        "correct": "Johannes Kepler",
        "hint": "He gave us elliptical orbits instead of 'perfect circles'."
    },
    {
        "id": 3,
        "question": "A war that killed millions technically began because someone’s car took a wrong turn.",
        "options": [
            "Crimean War",
            "World War I",
            "Spanish Civil War",
            "Franco-Prussian War"
        ],
        "correct": "World War I",
        "hint": "Think about the assassination of Archduke Franz Ferdinand."
    },
    {
        "id": 4,
        "question": "An entire war was launched because a face was 'too pretty.'",
        "options": [
            "Trojan War",
            "World War I",
            "War of the Roses",
            "Spanish Armada"
        ],
        "correct": "Trojan War",
        "hint": "Helen of Troy was literally called 'the face that launched a thousand ships.'"
    },
    {
        "id": 5,
        "question": "A bunch of wizards fight over jewelry for three movies straight.",
        "options": [
            "Harry Potter",
            "The Lord of the Rings",
            "The Chronicles of Narnia",
            "Percy Jackson"
        ],
        "correct": "The Lord of the Rings",
        "hint": "One ring to rule them all."
    },
    {
        "id": 6,
        "question": "A guy spends 27 years in jail and then becomes president — no Netflix deal.",
        "options": [
            "Mahatma Gandhi",
            "Martin Luther King Jr.",
            "Nelson Mandela",
            "Barack Obama"
        ],
        "correct": "Nelson Mandela",
        "hint": "Think about South Africa and apartheid."
    },
    {
        "id": 7,
        "question": "The most important scientific revolution started because a monk had too much time counting peas.",
        "options": [
            "Charles Darwin’s 'Origin of Species'",
            "Gregor Mendel’s genetics experiments",
            "Isaac Newton’s Laws of Motion",
            "Louis Pasteur’s microbiology tests"
        ],
        "correct": "Gregor Mendel’s genetics experiments",
        "hint": "He grew pea plants to figure out heredity."
    },
    {
        "id": 8,
        "question": "A scientist proved atoms exist by watching pollen do the cha-cha in water.",
        "options": [
            "Niels Bohr",
            "Albert Einstein",
            "Robert Brown",
            "Max Planck"
        ],
        "correct": "Albert Einstein",
        "hint": "He mathematically explained Brownian motion."
    },
    {
        "id": 9,
        "question": "A music genre invented when people couldn’t afford guitars, so they scratched vinyls instead.",
        "options": [
            "Punk",
            "Hip-Hop",
            "Jazz",
            "Reggae"
        ],
        "correct": "Hip-Hop",
        "hint": "Think about DJ turntables and block parties in the Bronx."
    },
    {
        "id": 10,
        "question": "A philosophy that says 'life is pain' became trendy for teenagers 2,000 years later.",
        "options": [
            "Epicureanism",
            "Cynicism",
            "Stoicism",
            "Nihilism"
        ],
        "correct": "Stoicism",
        "hint": "Think Marcus Aurelius, not Instagram influencers."
    }
];
export default function Level27Page() {
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
  const [skipLoading,setskipLoading]=useState(false);
  const [submitLoading,setSubmitLoading]=useState(false);
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

  const [showRules, setShowRules] = useState<boolean>(true);

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

      if (teamData.current_level > 27) {
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

    // Show modal on first load unless previously dismissed
    const rulesSeen = localStorage.getItem('level27_rules_shown');
    if (rulesSeen) {
      setShowRules(false);
    }

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
          router.push('/levels');
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [team, timerStatus]);

  // Auto-clear flash state after short animation
  useEffect(() => {
    if (flashState) {
      const timer = setTimeout(() => {
        setFlashState(null);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [flashState]);

  // Flash effect component
  const FlashEffect = () => {
    if (!flashState) return null;
    return (
      <div
        className={`fixed inset-0 z-50 pointer-events-none animate-flash ${
          flashState === 'correct' ? 'bg-green-500/30' : 'bg-red-500/30'
        }`}
      />
    );
  };

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
    const isCorrect = answer === currentQuestion.correct;

    // Trigger flash effect for visual feedback
    setFlashState(isCorrect ? 'correct' : 'incorrect');

     if(submitLoading){
      return;
    }

    setSubmitLoading(true);
    
    // Update local stats

    try{
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
  }

  catch(err){
     console.error(" API request for submit answer failed", err);
  }

  finally{
    setSubmitLoading(false);
  }
  };

  const handleSkip = async () => {
    if(skipLoading){
      return;
    }

    setskipLoading(true)

    try{
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
  }

    catch (err) {
      console.error(" API request for skip question failed", err);
  }

  finally{
    setskipLoading(false);
  }
  };

  const handleHint = () => {
    setShowHint(true);
    const newStats = { ...levelStats };
    newStats.hintsUsed++;
    setLevelStats(newStats);
  };

  /**
   * ENHANCED SCORING ALGORITHM
   *
   * Calculates the final score for Level-1 based on multiple factors:
   *
   * BASE SCORING:
   * - Correct answers without hints: 1500 points each
   * - Correct answers with hints: 1000 points each (500 point penalty for hint usage)
   * - Incorrect answers: -400 points penalty each
   * - Skipped questions: -750 points penalty each
   *
   * BONUS SYSTEMS:
   * - Consecutive Correct Bonus: +200 points for every 3 consecutive correct answers
   * - Time Bonus: Rewards fast completion with decreasing bonuses based on time taken
   *
   * PERFORMANCE RATING:
   * - Excellent: 90%+ accuracy, under 3 minutes
   * - Good: 70%+ accuracy, under 4 minutes
   * - Average: 50%+ accuracy, under 5 minutes
   * - Needs Improvement: Below 50% accuracy or over 5 minutes
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
    // Use provided completion time if available, otherwise calculate from current time
    const timeTaken = completionTime !== undefined ? 
      completionTime : 
      (new Date().getTime() - levelStartTime.getTime()) / 1000 / 60; // minutes
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

    // Time bonus calculation
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

    // Performance rating
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
    const newLevel = 28;

    try {
      // CRITICAL FIX: Ensure final level statistics are accurately saved to database
      //
      // Problem: The incremental updates during gameplay might miss some statistics,
      // especially hint counts that are shown but not immediately saved to database.
      //
      // Solution: At level completion, calculate the final statistics based on:
      // - Initial team stats (captured when level started)
      // - Local level stats (accurate count for this level)
      // This ensures the database reflects the exact performance shown to the user.

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

    //   // Save checkpoint if this is a checkpoint level
    //   if (isCheckpointLevel(1)) {
    //     await fetch(`/api/teams/${teamCode}/checkpoint`, {
    //       method: 'PUT',
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify({
    //         checkpoint_score: newTotalScore,
    //         checkpoint_level: 5
    //       })
    //     });
    //   }

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
          <p className="text-lg text-gray-600">Loading Level 27...</p>
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
            <CardTitle className="text-3xl font-bold text-green-700">Level 27 Complete!</CardTitle>
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
              Continue to Level 28
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
      <FlashEffect />
      {/* Rules Modal */}
      <RulesModal
        open={showRules && !isCompleted}
        onClose={() => setShowRules(false)}
      />

      {/* Wrap content for modal visibility control */}
      <div className={`transition-opacity duration-300 ${showRules ? 'opacity-0' : 'opacity-100'}`}>
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-purple-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  Level 27
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
                    onClick={() => handleAnswer(selectedAnswer)}
                    disabled={!selectedAnswer || submitLoading}
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
    </div>
  );
}

