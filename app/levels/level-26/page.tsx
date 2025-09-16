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
import { Team, isCheckpointLevel, getGameTimeRemaining, formatTimeRemaining, getGameTimerStatus } from "@/lib/supabase";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: string;
  hint: string;
}

/**
 * LEVEL-4 QUESTION BANK
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
        id: 1,
        question: "Who is known as the 'Missile Man of India'?",
        options: ["Dr. A. P. J. Abdul Kalam", "Dr. Vikram Sarabhai", "Dr. Homi Bhabha", "Dr. C. V. Raman"],
        correct: "Dr. A. P. J. Abdul Kalam",
        hint: "He served as the 11th President of India and was a pioneer in ballistic missile development"
    },
    {
        id: 2,
        question: "The Netflix series 'Money Heist' is originally from which country?",
        options: ["Spain", "USA", "France", "Italy"],
        correct: "Spain",
        hint: "The original title is 'La Casa de Papel'"
    },
    {
        id: 3,
        question: "In cricket, who was the first bowler to take 10 wickets in a single Test innings?",
        options: ["Jim Laker", "Anil Kumble", "Shane Warne", "Muttiah Muralitharan"],
        correct: "Jim Laker",
        hint: "This English bowler achieved this feat in 1956 against Australia"
    },
    {
        id: 4,
        question: "Kerala's state bird, known for its striking blue and orange plumage, is?",
        options: ["Great Hornbill", "Indian Roller", "Paradise Flycatcher", "Malabar Trogon"],
        correct: "Great Hornbill",
        hint: "This large bird is also known as 'Malamuzhakki' in Malayalam"
    },
    {
        id: 5,
        question: "Which is the only country that has won the FIFA World Cup on four different continents?",
        options: ["Brazil", "Germany", "None", "France"],
        correct: "None",
        hint: "This is a trick question - no country has achieved this feat yet"
    },
    {
        id: 6,
        question: "Who was the last Governor-General of independent India?",
        options: ["Lord Mountbatten", "C. Rajagopalachari", "Dr. Rajendra Prasad", "Jawaharlal Nehru"],
        correct: "C. Rajagopalachari",
        hint: "He served from June 1948 to January 1950, before India became a Republic"
    },
    {
        id: 7,
        question: "Microsoft's first-ever hardware product wasn't a console or a PC. What was it?",
        options: ["Mouse", "Keyboard", "Joystick", "Printer"],
        correct: "Mouse",
        hint: "Released in 1983, it was called the Microsoft Mouse"
    },
    {
        id: 8,
        question: "If planets had 'reverse gears,' which one rotates backward compared to most others?",
        options: ["Mars", "Venus", "Uranus", "Mercury"],
        correct: "Venus",
        hint: "This planet rotates clockwise, opposite to Earth's counterclockwise rotation"
    },
    {
        id: 9,
        question: "Which Indian city is famous for its Chand Baori stepwell?",
        options: ["Jaipur", "Abhaneri", "Udaipur", "Jodhpur"],
        correct: "Abhaneri",
        hint: "Located in Rajasthan, this stepwell is one of the largest and deepest in India"
    },
    {
        id: 10,
        question: "The Golden Boot winner of FIFA 2022, scoring 8 goals, was?",
        options: ["Lionel Messi", "Kylian Mbappé", "Olivier Giroud", "Julian Alvarez"],
        correct: "Kylian Mbappé",
        hint: "This French footballer scored a hat-trick in the final against Argentina"
    },
    {
        id: 11,
        question: "In Kerala, the famous hill station Munnar is located in which district?",
        options: ["Wayanad", "Idukki", "Palakkad", "Kannur"],
        correct: "Idukki",
        hint: "This district is known for its tea plantations and hydroelectric projects"
    },
    {
        id: 12,
        question: "Which countries are hosting FIFA 2026?",
        options: ["US and Mexico", "US, Mexico and Canada", "Brazil and Argentina", "Spain and Portugal"],
        correct: "US, Mexico and Canada",
        hint: "This will be the first World Cup hosted by three nations"
    },
    {
        id: 13,
        question: "Who wrote the Indian national anthem 'Jana Gana Mana'?",
        options: ["Bankim Chandra Chattopadhyay", "Rabindranath Tagore", "Sarojini Naidu", "Mahatma Gandhi"],
        correct: "Rabindranath Tagore",
        hint: "He was the first non-European to win the Nobel Prize in Literature"
    },
    {
        id: 14,
        question: "The internet's first viral dance challenge, the 'Harlem Shake,' exploded in which year?",
        options: ["2011", "2012", "2013", "2014"],
        correct: "2013",
        hint: "This meme featured people dancing to a song by Baauer"
    },
    {
        id: 15,
        question: "Which Mughal ruler is often called the 'Engineer King' for his architectural projects?",
        options: ["Akbar", "Shah Jahan", "Jahangir", "Aurangzeb"],
        correct: "Shah Jahan",
        hint: "He commissioned the Taj Mahal"
    },
    {
        id: 16,
        question: "If the Sun disappeared, how many minutes would Earth still see sunlight?",
        options: ["4 minutes", "6 minutes", "8 minutes", "10 minutes"],
        correct: "8 minutes",
        hint: "This is the time light takes to travel from the Sun to Earth"
    },
    {
        id: 17,
        question: "Who was the first Indian to win the World Chess Championship?",
        options: ["Viswanathan Anand", "P. Harikrishna", "Pentala Harikrishna", "Koneru Humpy"],
        correct: "Viswanathan Anand",
        hint: "He won this title five times between 2000 and 2013"
    },
    {
        id: 18,
        question: "The Malayalam film 'Drishyam' was remade into how many languages officially?",
        options: ["3", "4", "5", "6"],
        correct: "4",
        hint: "It was remade in Hindi, Tamil, Telugu, and Kannada"
    },
    {
        id: 19,
        question: "Which Greek goddess was believed to have sprung fully grown from the head of Zeus?",
        options: ["Hera", "Aphrodite", "Athena", "Artemis"],
        correct: "Athena",
        hint: "She is the goddess of wisdom and strategic warfare"
    },
    {
        id: 20,
        question: "Which Indian athlete is nicknamed the 'Flying Sikh'?",
        options: ["P.T. Usha", "Milkha Singh", "Gurbachan Singh Randhawa", "Sriram Singh"],
        correct: "Milkha Singh",
        hint: "He narrowly missed a medal in the 400m at the 1960 Rome Olympics"
    },
    {
        id: 21,
        question: "Which Kerala river is known as the Periyar of the South?",
        options: ["Bharathapuzha", "Chaliyar", "Pamba", "Neyyar"],
        correct: "Chaliyar",
        hint: "This river flows through Nilambur teak forests"
    }
];

export default function Level26Page() {
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

      if (teamData.current_level > 26) {
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
    const newTotalScore = team.score + scoreData.totalScore;
    const newLevel = 27;

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

      // Save checkpoint if this is a checkpoint level
      if (isCheckpointLevel(1)) {
        await fetch(`/api/teams/${teamCode}/checkpoint`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            checkpoint_score: newTotalScore,
            checkpoint_level: 1
          })
        });
      }

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
          <p className="text-lg text-gray-600">Loading Level 26...</p>
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
            <CardTitle className="text-3xl font-bold text-green-700">Level 26 Complete!</CardTitle>
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
              Continue to Level 27
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
                Level 4
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
  );
}
