/**
 * LEVEL-2 QUIZ IMPLEMENTATION - TECHDOS GAME
 *
 * OVERVIEW:
 * Level-2 represents the second stage of the TechDOS quiz game, featuring a comprehensive
 * multiple-choice question (MCQ) format designed to test advanced knowledge across various
 * domains including technology, science, mathematics, programming, and modern innovations.
 *
 * QUIZ MECHANICS:
 * - Format: Multiple Choice Questions (MCQ) with 4 options each
 * - Total Questions: 20 diverse questions covering different knowledge areas
 * - Hint System: Each question includes a helpful hint that can be revealed
 * - Timer Integration: Real-time countdown with global game timer
 * - Navigation Protection: Prevents accidental page refresh/navigation during quiz
 *
 * GAME FLOW:
 * 1. Question Selection: Questions are presented sequentially (no random order)
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
 * - Correct Answer (no hint): 1500 points
 * - Correct Answer (with hint): 1000 points
 * - Incorrect Answer: -400 points penalty
 * - Skipped Question: -750 points penalty
 *
 * Bonus Systems:
 * - Consecutive Correct Bonus: +200 points for every 3 consecutive correct answers
 * - Time Bonus (based on completion speed):
 *   * Under 1 min: +250 points
 *   * 1-1.5 min: +225 points
 *   * 1.5-2 min: +200 points
 *   * 2-2.5 min: +175 points
 *   * 2.5-3 min: +150 points
 *   * 3-3.5 min: +125 points
 *   * 3.5-4 min: +100 points
 *   * 4-4.5 min: +75 points
 *   * 4.5-5 min: +50 points
 *   * 5-5.5 min: +25 points
 *   * Over 5.5 min: No time bonus
 *
 * FINAL SCORE CALCULATION:
 * Total Score = (Base Points) + (Consecutive Bonus) + (Time Bonus)
 * Minimum Score: 0 (negative scores are clamped to zero)
 *
 * INTEGRATION FEATURES:
 * - Global Timer: Respects game-wide time limits and displays remaining time
 * - Team Management: Updates team statistics and progression status
 * - API Integration: Real-time updates to database for scores and statistics
 * - Navigation Control: Prevents data loss through page navigation protection
 * - Toast Notifications: User feedback for actions and errors
 *
 * LEVEL COMPLETION SUMMARY:
 * Upon completion, players receive detailed feedback including:
 * - Performance breakdown (correct/incorrect/skipped/hints)
 * - Time taken to complete the level
 * - Detailed scoring breakdown showing base points, bonuses, and penalties
 * - Performance rating based on accuracy and speed
 * - Clear navigation to proceed to the next level
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
 * LEVEL-2 QUESTION BANK
 *
 * A diverse collection of 20 multiple-choice questions covering:
 * - Astronomy & Science (planets, space exploration)
 * - Indian History & Politics (leaders, achievements, firsts)
 * - Entertainment & Cinema (movies, awards, celebrities)
 * - Sports & Olympics (cricket, Olympic achievements)
 * - Geography & Culture (cities, festivals, landmarks)
 * - Literature & Awards (Nobel Prize, Booker Prize, authors)
 *
 * Each question includes:
 * - 4 carefully crafted options with plausible distractors
 * - One correct answer
 * - A helpful hint that provides context without giving away the answer
 */
const questions: Question[] = [
  {
    id: 1,
    question: "If Earth had a crazy cousin that spins on its side like a rolling ball around the Sun, which planet would that be?",
    options: ["Uranus", "Neptune", "Saturn", "Jupiter"],
    correct: "Uranus",
    hint: "This ice giant planet rotates on its side at a 98-degree angle, making it appear to roll around the Sun."
  },
  {
    id: 2,
    question: "Who was the first woman to become the Chief Minister of an Indian state?",
    options: ["Sucheta Kripalani (Uttar Pradesh, 1963)", "Indira Gandhi", "Jayalalithaa", "Mamata Banerjee"],
    correct: "Sucheta Kripalani (Uttar Pradesh, 1963)",
    hint: "She was a freedom fighter and became the first woman Chief Minister in India, serving Uttar Pradesh from 1963 to 1967."
  },
  {
    id: 3,
    question: "The movie 'Inception' plays with the concept of dreams within dreams. Who directed it?",
    options: ["Christopher Nolan", "Steven Spielberg", "Martin Scorsese", "Quentin Tarantino"],
    correct: "Christopher Nolan",
    hint: "This British-American director is known for complex, non-linear storytelling and mind-bending concepts in films like this 2010 sci-fi thriller."
  },
  {
    id: 4,
    question: "Which Indian cricket captain is called 'Dada' and 'Prince of Kolkata'?",
    options: ["Sourav Ganguly", "Sachin Tendulkar", "Rahul Dravid", "MS Dhoni"],
    correct: "Sourav Ganguly",
    hint: "This former Indian cricket captain from Kolkata is affectionately called 'Dada' (elder brother) and led India to many memorable victories."
  },
  {
    id: 5,
    question: "A city in Kerala is nicknamed the 'Venice of the East' because of its backwaters. Which city?",
    options: ["Alappuzha", "Kochi", "Thiruvananthapuram", "Kozhikode"],
    correct: "Alappuzha",
    hint: "This coastal city is famous for its intricate network of canals, lagoons, and backwaters, earning it the nickname 'Venice of the East'."
  },
  {
    id: 6,
    question: "In FIFA World Cup history, which country has lost the most finals?",
    options: ["Germany", "Brazil", "Argentina", "Italy"],
    correct: "Germany",
    hint: "Germany has reached the World Cup final 8 times but lost 4 of them, making them the country with the most final defeats in World Cup history."
  },
  {
    id: 7,
    question: "If you were looking for Mount Everest's neighbor, which mountain is the second highest in the world?",
    options: ["K2", "Kangchenjunga", "Lhotse", "Makalu"],
    correct: "K2",
    hint: "Located on the China-Pakistan border, this mountain is known as the 'Savage Mountain' and is considered more challenging to climb than Everest."
  },
  {
    id: 8,
    question: "Who was the first Indian actress to receive the Padma Shri Award?",
    options: ["Nargis Dutt", "Meena Kumari", "Madhubala", "Waheeda Rehman"],
    correct: "Nargis Dutt",
    hint: "This legendary actress, known for films like 'Mother India', received the Padma Shri in 1958, becoming the first Indian actress to receive this civilian honor."
  },
  {
    id: 9,
    question: "The Android operating system was originally developed by which company before Google acquired it?",
    options: ["Android Inc.", "Microsoft", "Apple", "Samsung"],
    correct: "Android Inc.",
    hint: "Founded in 2003 by Andy Rubin, Rich Miner, Nick Sears, and Chris White, this company was acquired by Google in 2005 for about $50 million."
  },
  {
    id: 10,
    question: "Which Indian state is famous for the Hornbill Festival?",
    options: ["Nagaland", "Manipur", "Mizoram", "Arunachal Pradesh"],
    correct: "Nagaland",
    hint: "This northeastern state celebrates the Hornbill Festival annually in December, showcasing the rich culture and traditions of the Naga tribes."
  },
  {
    id: 11,
    question: "Who was the first Indian woman to win an Olympic silver medal?",
    options: ["P. V. Sindhu (badminton, 2016)", "Saina Nehwal", "Mary Kom", "Karnam Malleswari"],
    correct: "P. V. Sindhu (badminton, 2016)",
    hint: "This badminton player from Hyderabad won silver at the 2016 Rio Olympics, becoming the first Indian woman to win an Olympic silver medal."
  },
  {
    id: 12,
    question: "Who was the first Indian batsman to hit six sixes in an over in international cricket?",
    options: ["Yuvraj Singh (2007 T20 World Cup)", "Rohit Sharma", "MS Dhoni", "Virender Sehwag"],
    correct: "Yuvraj Singh (2007 T20 World Cup)",
    hint: "In the 2007 T20 World Cup against England, this left-handed batsman hit Stuart Broad for six consecutive sixes in one over."
  },
  {
    id: 13,
    question: "The Nobel Prize medal features the portrait of which scientist?",
    options: ["Alfred Nobel", "Albert Einstein", "Marie Curie", "Isaac Newton"],
    correct: "Alfred Nobel",
    hint: "The founder of the Nobel Prizes, this Swedish chemist and inventor of dynamite is featured on the medal that bears his name."
  },
  {
    id: 14,
    question: "Which Indian city is known as the 'City of Nawabs'?",
    options: ["Lucknow", "Hyderabad", "Delhi", "Mysore"],
    correct: "Lucknow",
    hint: "The capital of Uttar Pradesh, this city was ruled by the Nawabs of Awadh and is famous for its rich culture, cuisine, and architecture."
  },
  {
    id: 15,
    question: "If music awards were planets, the 'Grammy' is Earth's biggest. Which award is considered the world's highest honor in cinema?",
    options: ["The Oscars (Academy Awards)", "Golden Globe", "Cannes Film Festival", "BAFTA"],
    correct: "The Oscars (Academy Awards)",
    hint: "Presented by the Academy of Motion Picture Arts and Sciences, this is considered the most prestigious award in the film industry."
  },
  {
    id: 16,
    question: "In Kerala, which river is the longest?",
    options: ["Periyar River", "Bharathapuzha", "Pamba River", "Chaliyar River"],
    correct: "Periyar River",
    hint: "This 244 km long river flows through Kerala and is the longest river in the state, originating from the Western Ghats."
  },
  {
    id: 17,
    question: "The fastest man-made object ever built is a spacecraft that 'touched the Sun.' What is its name?",
    options: ["Parker Solar Probe", "Voyager 1", "New Horizons", "Juno"],
    correct: "Parker Solar Probe",
    hint: "Launched in 2018, this NASA spacecraft holds the record for the fastest human-made object, reaching speeds of up to 430,000 mph."
  },
  {
    id: 18,
    question: "Who was India's first individual Olympic gold medalist?",
    options: ["Abhinav Bindra (2008, shooting)", "Rajyavardhan Singh Rathore", "Vijay Kumar", "Gagan Narang"],
    correct: "Abhinav Bindra (2008, shooting)",
    hint: "This shooter from Chandigarh won gold in the 10m Air Rifle event at the 2008 Beijing Olympics, becoming India's first individual Olympic gold medalist."
  },
  {
    id: 19,
    question: "In literature, which Indian author wrote the novel 'The White Tiger' (Booker Prize winner)?",
    options: ["Aravind Adiga", "Salman Rushdie", "Arundhati Roy", "Vikram Seth"],
    correct: "Aravind Adiga",
    hint: "This Indian-Australian author won the Man Booker Prize in 2008 for his debut novel about class struggle in modern India."
  },
  {
    id: 20,
    question: "Which superhero's real name is T'Challa?",
    options: ["Black Panther", "Black Widow", "Black Lightning", "Black Canary"],
    correct: "Black Panther",
    hint: "This Marvel superhero is the king of Wakanda and first appeared in Fantastic Four #52 in 1966, later getting his own series and movie."
  }
];

export default function Level23Page() {
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

      if (teamData.current_level > 23) {
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
    
    // Update local stats
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
  };

  const handleSkip = async () => {
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
    const newLevel = 24;

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
          <p className="text-lg text-gray-600">Loading Level 23...</p>
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
            <CardTitle className="text-3xl font-bold text-green-700">Level 23 Complete!</CardTitle>
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
              Continue to Level 24
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
                Level 2
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
                  className="flex-1 text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                >
                  <SkipForward className="mr-2 h-4 w-4" />
                  Skip Question
                </Button>
                
                <Button
                  onClick={() => handleAnswer(selectedAnswer)}
                  disabled={!selectedAnswer}
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
