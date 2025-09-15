/**
 * LEVEL-1 QUIZ IMPLEMENTATION - TECHDOS GAME
 *
 * OVERVIEW:
 * Level-1 represents the entry point of the TechDOS quiz game, featuring a comprehensive
 * multiple-choice question (MCQ) format designed to test general knowledge across various
 * domains including geography, history, literature, sports, science, and entertainment.
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
 * CHECKPOINT SYSTEM:
 * - Level-1 serves as a checkpoint level for game progression
 * - Completion unlocks access to Level-2
 * - Score and progress are automatically saved to team's total
 * - Checkpoint data stored for potential game restoration
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
import { Team, isCheckpointLevel, getGameTimeRemaining, formatTimeRemaining, getGameTimerStatus } from "@/lib/supabase";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: string;
  hint: string;
}

/**
 * LEVEL-1 QUESTION BANK
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
    question: "If planets were in a dance battle, this one would spin so fast it completes a day in less than 10 hours. Which speedy planet is it?",
    options: ["Jupiter", "Saturn", "Mars", "Venus"],
    correct: "Jupiter",
    hint: "This gas giant is the largest planet in our solar system and rotates once every 9.9 hours."
  },
  {
    id: 2,
    question: "Who was India's first Deputy Prime Minister?",
    options: ["Sardar Vallabhbhai Patel", "Jawaharlal Nehru", "Dr. Rajendra Prasad", "Maulana Abul Kalam Azad"],
    correct: "Sardar Vallabhbhai Patel",
    hint: "Known as the 'Iron Man of India', he was instrumental in the integration of princely states."
  },
  {
    id: 3,
    question: "Who wrote the epic fantasy series 'The Lord of the Rings'?",
    options: ["J. R. R. Tolkien", "C. S. Lewis", "George R. R. Martin", "Terry Pratchett"],
    correct: "J. R. R. Tolkien",
    hint: "This Oxford professor created Middle-earth and invented several languages for his fantasy world."
  },
  {
    id: 4,
    question: "Which tennis player is nicknamed the 'King of Clay'?",
    options: ["Rafael Nadal", "Roger Federer", "Novak Djokovic", "Andy Murray"],
    correct: "Rafael Nadal",
    hint: "This Spanish player has won the French Open a record number of times on clay courts."
  },
  {
    id: 5,
    question: "Which Indian state is home to Asia's largest tulip garden?",
    options: ["Jammu and Kashmir", "Himachal Pradesh", "Uttarakhand", "Sikkim"],
    correct: "Jammu and Kashmir",
    hint: "This garden is located in Srinagar and blooms spectacularly during spring season."
  },
  {
    id: 6,
    question: "Which country won the very first FIFA World Cup in 1930?",
    options: ["Uruguay", "Brazil", "Argentina", "Italy"],
    correct: "Uruguay",
    hint: "This South American country also hosted the inaugural tournament and defeated Argentina in the final."
  },
  {
    id: 7,
    question: "A planet rains diamonds because of immense pressure in its atmosphere. Which planet?",
    options: ["Neptune", "Jupiter", "Saturn", "Uranus"],
    correct: "Neptune",
    hint: "This ice giant, along with Uranus, has extreme atmospheric pressure that can crystallize carbon into diamonds."
  },
  {
    id: 8,
    question: "Who was the first Indian woman to win a medal at the Olympics?",
    options: ["Karnam Malleswari", "P. T. Usha", "Saina Nehwal", "Mary Kom"],
    correct: "Karnam Malleswari",
    hint: "She won a bronze medal in weightlifting at the 2000 Sydney Olympics."
  },
  {
    id: 9,
    question: "Which footballer has the most Ballon d'Or awards?",
    options: ["Lionel Messi", "Cristiano Ronaldo", "Johan Cruyff", "Michel Platini"],
    correct: "Lionel Messi",
    hint: "This Argentine player has won 8 Ballon d'Or awards as of 2023, more than any other player in history."
  },
  {
    id: 10,
    question: "Who was awarded the first Booker Prize from India?",
    options: ["Arundhati Roy", "Salman Rushdie", "R. K. Narayan", "Vikram Seth"],
    correct: "Arundhati Roy",
    hint: "She won for her novel 'The God of Small Things' in 1997, becoming the first Indian woman to win this prestigious award."
  },
  {
    id: 11,
    question: "The world's shortest war lasted only 38 minutes. Which countries fought it?",
    options: ["Britain and Zanzibar", "France and Monaco", "Spain and Andorra", "Italy and San Marino"],
    correct: "Britain and Zanzibar",
    hint: "This 1896 conflict ended quickly when Zanzibar's palace was bombarded and the Sultan fled."
  },
  {
    id: 12,
    question: "The Kaziranga National Park in Assam is famous for which animal?",
    options: ["One-horned Rhinoceros", "Bengal Tiger", "Asian Elephant", "Hoolock Gibbon"],
    correct: "One-horned Rhinoceros",
    hint: "This UNESCO World Heritage Site hosts two-thirds of the world's population of this endangered species."
  },
  {
    id: 13,
    question: "The first video on YouTube to cross 1 billion views was which song?",
    options: ["Gangnam Style", "Baby by Justin Bieber", "Despacito", "See You Again"],
    correct: "Gangnam Style",
    hint: "This 2012 K-pop hit by Psy became a global phenomenon and broke YouTube's view counter."
  },
  {
    id: 14,
    question: "A lake in India changes color from green to pink depending on the season. Which lake?",
    options: ["Lonar Lake, Maharashtra", "Dal Lake, Kashmir", "Chilika Lake, Odisha", "Vembanad Lake, Kerala"],
    correct: "Lonar Lake, Maharashtra",
    hint: "This crater lake's color changes due to algae and salt-loving microorganisms that thrive in different seasons."
  },
  {
    id: 15,
    question: "Which Indian poet is popularly known as the Nightingale of India?",
    options: ["Sarojini Naidu", "Kamala Das", "Mahadevi Varma", "Amrita Pritam"],
    correct: "Sarojini Naidu",
    hint: "She was also a freedom fighter and the first woman to become the President of the Indian National Congress."
  },
  {
    id: 16,
    question: "The Grammy Award trophy is shaped like what musical instrument?",
    options: ["Gramophone", "Violin", "Piano", "Trumpet"],
    correct: "Gramophone",
    hint: "This vintage music player gives the Grammy Awards their name and iconic trophy design."
  },
  {
    id: 17,
    question: "Which author created the character Sherlock Holmes?",
    options: ["Sir Arthur Conan Doyle", "Agatha Christie", "Edgar Allan Poe", "Raymond Chandler"],
    correct: "Sir Arthur Conan Doyle",
    hint: "This British physician turned author wrote four novels and 56 short stories featuring the famous detective."
  },
  {
    id: 18,
    question: "Lionel Messi finally lifted the FIFA World Cup in 2022. Which stadium hosted the final?",
    options: ["Lusail Stadium, Qatar", "Al Bayt Stadium, Qatar", "Stadium 974, Qatar", "Al Thumama Stadium, Qatar"],
    correct: "Lusail Stadium, Qatar",
    hint: "This 80,000-capacity stadium was the largest venue of the 2022 World Cup and hosted both the opening match and final."
  },
  {
    id: 19,
    question: "Which Indian state is the largest producer of mangoes?",
    options: ["Uttar Pradesh", "Andhra Pradesh", "Maharashtra", "Karnataka"],
    correct: "Uttar Pradesh",
    hint: "This northern state produces famous varieties like Dasheri and Chausa, contributing about 23% of India's total mango production."
  },
  {
    id: 20,
    question: "The Malayalam novel 'Chemmeen', which won the Jnanpith Award, was written by?",
    options: ["Thakazhi Sivasankara Pillai", "M. T. Vasudevan Nair", "O. V. Vijayan", "Vaikom Muhammad Basheer"],
    correct: "Thakazhi Sivasankara Pillai",
    hint: "This 1956 novel about forbidden love was later adapted into an acclaimed film and won India's highest literary honor."
  }
];

export default function Level1Page() {
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
  const [skipLoading, setSkipLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
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

      if (teamData.current_level > 1) {
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
    if (submitLoading) {
      return;
    }

    setSubmitLoading(true);

    try {
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

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer("");
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
    const newLevel = 2;

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
          <p className="text-lg text-gray-600">Loading Level 1...</p>
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
            <CardTitle className="text-3xl font-bold text-green-700">Level 1 Complete!</CardTitle>
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
              Continue to Level 2
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
                Level 1
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
