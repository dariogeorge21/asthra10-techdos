'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Timer, 
  CheckCircle, 
  ArrowRight,
  Target,
  Brain,
  Search,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { getGameTimeRemaining, getGameTimerStatus, formatTimeRemaining } from '@/lib/supabase';

interface MCQQuestion {
  id: number;
  type: 'Memory' | 'Deduction';
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Team {
  id: string;
  name: string;
  score: number;
  current_level: number;
  team_name: string;
  team_code: string;
  game_loaded: boolean;
  game_start_time: string | null;
  checkpoint_score: number;
  checkpoint_level: number;
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

type GamePhase = 'loading' | 'story' | 'questions' | 'completed';

export default function Level14Page() {
  const router = useRouter();
  
  // Game state
  const [gamePhase, setGamePhase] = useState<GamePhase>('story');
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [skipLoading, setSkipLoading] = useState(false);
  
  // Intro popup (bottom-right) progress for 30s
  const [showIntroPopup, setShowIntroPopup] = useState(true);
  const [introProgress, setIntroProgress] = useState(0);
  
  // Team and stats
  const [team, setTeam] = useState<Team | null>(null);
  const [levelStats, setLevelStats] = useState({
    correct: 0,
    incorrect: 0,
    skipped: 0
  });
  const [initialTeamStats, setInitialTeamStats] = useState<TeamStats | null>(null);
  
  // Timer
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerStatus, setTimerStatus] = useState<'not_started' | 'active' | 'expired'>('not_started');
  const [levelStartTime] = useState(new Date());
  const [completionTimeMinutes, setCompletionTimeMinutes] = useState(0);

  // Story content
  const storyContent = [
    {
      title: "Ready to Enter Your Detective Era?",
      content: "Congrats, you've cracked all rounds so far… but beware, the challenges ahead are far more difficult. Every detail will test your mind.\n\nThe Vault Opens… Observe, Decode, Conquer. Read carefully—one missed clue could cost you the case."
    },
    {
      title: "The Crime Scene",
      content: "Detective Kael arrived at the Grayson Research Facility at 2:07 AM. The facility's advanced security system had triggered an alert: the central vault had been opened without a recorded access. On the floor lay a single microchip with the number sequence 17-4-23-2 etched into it. The air smelled faintly metallic, like overheated circuits."
    },
    {
      title: "The Suspects",
      content: "Three people had been logged as present in the lab:\n\nDr. Vale, the lead cryptographer, who claimed to be calibrating the quantum server.\n\nAlex, the AI engineer, who said they were testing drone sensors in the west wing.\n\nMorgan, the intern, who insisted they were reviewing schematics in the control room."
    },
    {
      title: "The Evidence",
      content: "Kael noticed a monitor displaying a blinking pattern: red, green, blue, green, red, blue. The vault door was slightly ajar, showing a faint reflection of a figure crouched behind the security console. A digital notepad had a half-completed formula: X² + 7Y = ?."
    },
    {
      title: "The Final Clue",
      content: "On the floor, next to the microchip, was a small folded card with a QR code. Scanning it revealed a cryptic message: \"Time is the key, but only prime minutes matter.\" The security logs showed a spike at exactly 2:13 AM, six minutes after Kael's arrival. Kael realized that the culprit had left all the clues intentionally… but why?"
    }
  ];

  // MCQ Questions
  const questions: MCQQuestion[] = [
    // Memory MCQs
    {
      id: 1,
      type: 'Memory',
      question: 'At what exact time did Detective Kael arrive at the facility?',
      options: ['2:00 AM', '2:07 AM', '2:13 AM', '1:57 AM'],
      correctAnswer: 1
    },
    {
      id: 2,
      type: 'Memory',
      question: 'What number sequence was etched on the microchip?',
      options: ['17-4-23-2', '12-7-19-3', '23-2-17-4', '7-14-21-28'],
      correctAnswer: 0
    },
    {
      id: 3,
      type: 'Memory',
      question: 'Which three people were present in the lab?',
      options: ['Dr. Vale, Alex, Kael', 'Alex, Morgan, Kael','Dr. Vale, Alex, Morgan', 'Dr. Vale, Morgan, Kael'],
      correctAnswer: 2
    },
    {
      id: 4,
      type: 'Memory',
      question: 'What blinking pattern was displayed on the monitor?',
      options: [ 'Green, red, blue, red, green, blue', 'Red, blue, green, red, blue, green', 'Blue, green, red, blue, green, red','Red, green, blue, green, red, blue'],
      correctAnswer: 3
    },
    {
      id: 5,
      type: 'Memory',
      question: 'What cryptic message appeared when the QR code was scanned?',
      options: ['Only odd numbers matter', 'Time is the key, but only prime minutes matter', 'Follow the blinking lights', 'X² + 7Y = ?'],
      correctAnswer: 1
    },
    // Deduction MCQs
    {
      id: 6,
      type: 'Deduction',
      question: 'Based on the number sequence and prime minute clue, who is most likely responsible?',
      options: ['Dr. Vale', 'Alex', 'Morgan', 'Unknown outsider'],
      correctAnswer: 0
    },
    {
      id: 7,
      type: 'Deduction',
      question: 'What does the half-completed formula X² + 7Y = ? most likely indicate?',
      options: ['A random scribble', 'A server code error','A math puzzle left for the detective', 'A drone calibration sequence'],
      correctAnswer: 2
    },
    {
      id: 8,
      type: 'Deduction',
      question: 'Why might the blinking monitor pattern be important?',
      options: ['It encodes the sequence to open the vault', 'It\'s a distraction', 'It signals a fire alarm', 'It\'s part of the lighting test'],
      correctAnswer: 0
    },
    {
      id: 9,
      type: 'Deduction',
      question: 'The microchip on the floor suggests:',
      options: ['The culprit wanted to be traced', 'A breadcrumb clue to the next puzzle', 'A failed device', 'A hacker warning'],
      correctAnswer: 1
    },
    {
      id: 10,
      type: 'Deduction',
      question: 'Considering all the clues, what strategy did the culprit likely use?',
      options: ['Random access and error', 'Planned access with cryptic clues left for a challenge', 'Forced entry with violence', 'Accidental access by mistake'],
      correctAnswer: 0
    }
  ];

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

      if (teamData.current_level < 14) {
        toast.info("You need to complete previous levels first!");
        router.push('/levels');
        return;
      }

      if (teamData.current_level > 14) {
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

  // Intro popup 30s line progress during story phase
  useEffect(() => {
    if (gamePhase !== 'story' || !showIntroPopup) return;
    const interval = setInterval(() => {
      setIntroProgress((prev) => {
        const next = prev + (100 / 30);
        if (next >= 100) {
          clearInterval(interval);
          setIntroProgress(100);
          setShowIntroPopup(false);
        }
        return next >= 100 ? 100 : next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gamePhase, showIntroPopup]);

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

  const handleStoryNext = () => {
    if (currentStoryIndex < storyContent.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      setGamePhase('questions');
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null) return;
    
    setSubmitLoading(true);
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    try {
      const newAnswers = [...userAnswers, selectedAnswer];
      setUserAnswers(newAnswers);
      
      if (isCorrect) {
        setLevelStats(prev => ({ ...prev, correct: prev.correct + 1 }));
      } else {
        setLevelStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
      }
      
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
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
    if (skipLoading) {
      return;
    }

    setSkipLoading(true);

    try {
      setLevelStats(prev => ({ ...prev, skipped: prev.skipped + 1 }));

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
      } else {
        completeLevel();
      }
    } catch (err) {
      console.error("Error skipping question:", err);
      toast.error("Failed to skip question. Please try again.");
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

    const correctWithoutHints = levelStats.correct;
    let baseScore = correctWithoutHints * 2000; // Higher score for brain test

    const penalties = (levelStats.incorrect * 500) + (levelStats.skipped * 1000);
    const consecutiveBonus = Math.floor(levelStats.correct / 3) * 300;

    let timeBonus = 0;
    if (timeTaken < 3) timeBonus = 500;
    else if (timeTaken < 5) timeBonus = 400;
    else if (timeTaken < 7) timeBonus = 300;
    else if (timeTaken < 10) timeBonus = 200;
    else if (timeTaken < 12) timeBonus = 100;

    let performanceRating = "Needs Improvement";
    if (accuracy >= 90 && timeTaken < 5) performanceRating = "Excellent";
    else if (accuracy >= 80 && timeTaken < 7) performanceRating = "Good";
    else if (accuracy >= 70 && timeTaken < 10) performanceRating = "Average";

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
    const newLevel = 15;

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
      setGamePhase('completed');
    } catch (error) {
      console.error('Error completing level:', error);
      toast.error("Failed to save progress. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading Level 14...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Failed to load team data.</p>
          <Button onClick={() => router.push('/')} className="mt-4">
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  // Removed blocking loading screen; we only show game timer. Intro appears as popup during story.

  // Story Phase
  if (gamePhase === 'story') {
    const currentStory = storyContent[currentStoryIndex];
    const isLastStory = currentStoryIndex === storyContent.length - 1;

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-6 w-6 text-indigo-600" />
                  <h1 className="text-2xl font-bold text-indigo-800">Level 14 - Detective Brain Test</h1>
                </div>
                <Badge variant="outline" className="text-indigo-700 border-indigo-300">
                  Story {currentStoryIndex + 1} of {storyContent.length}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Timer className="h-5 w-5 text-red-600" />
                <span className={`font-mono text-lg font-semibold ${getTimerDisplay().className}`}>
                  {getTimerDisplay().text}
                </span>
              </div>
            </div>
            
            <Progress value={((currentStoryIndex + 1) / storyContent.length) * 100} className="h-2 bg-indigo-100" />
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <Eye className="h-8 w-8 text-indigo-600 mr-2" />
                  <span className="text-2xl font-bold text-indigo-800">{currentStory.title}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
                <div className="text-lg leading-relaxed text-gray-700 whitespace-pre-line">
                  {currentStory.content}
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleStoryNext}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 text-lg"
                >
                  {isLastStory ? 'Continue to Questions' : 'Next'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {showIntroPopup && (
          <div className="fixed bottom-4 right-4 w-80 bg-white/90 backdrop-blur shadow-lg rounded-lg border border-indigo-200 overflow-hidden">
            <div className="px-4 py-3">
              <div className="flex items-center mb-2">
                <Brain className="h-5 w-5 text-indigo-600 mr-2" />
                <span className="font-semibold text-indigo-800">Entering Detective Mode</span>
              </div>
              <p className="text-sm text-gray-600">
                Ready to Enter Your Detective Era? Congrats, you've cracked all rounds so far… but beware, the challenges ahead are far more difficult. Every detail will test your mind.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                The Vault Opens… Observe, Decode, Conquer. Read carefully—one missed clue could cost you the case.
              </p>
            </div>
            <div className="px-4 pb-3">
              <div className="h-2 w-full rounded bg-indigo-100 overflow-hidden">
                <div className="h-2 bg-indigo-500 transition-all" style={{ width: `${introProgress}%` }} />
              </div>
              <div className="mt-1 text-right text-xs text-gray-500">
                {Math.max(0, Math.ceil(30 - (introProgress * 30 / 100)))}s
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // Questions Phase
  if (gamePhase === 'questions') {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Brain className="h-6 w-6 text-indigo-600" />
                  <h1 className="text-2xl font-bold text-indigo-800">Detective Brain Test</h1>
                </div>
                <Badge variant="outline" className="text-indigo-700 border-indigo-300">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </Badge>
                <Badge 
                  variant={currentQuestion.type === 'Memory' ? 'default' : 'secondary'}
                  className={currentQuestion.type === 'Memory' ? 
                    'bg-green-100 text-green-700 border-green-300' : 
                    'bg-purple-100 text-purple-700 border-purple-300'
                  }
                >
                  {currentQuestion.type} MCQ
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Timer className="h-5 w-5 text-red-600" />
                <span className={`font-mono text-lg font-semibold ${getTimerDisplay().className}`}>
                  {getTimerDisplay().text}
                </span>
              </div>
            </div>
            
            <Progress value={progress} className="h-2 bg-indigo-100" />
            <p className="text-sm text-gray-600 mt-2">
              Progress: {currentQuestionIndex + 1}/{questions.length} questions completed
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-center">
                <div className="text-xl font-bold text-indigo-800 mb-4">
                  {currentQuestion.question}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedAnswer === index ? "default" : "outline"}
                    className={`w-full text-left justify-start p-4 h-auto ${
                      selectedAnswer === index 
                        ? 'bg-indigo-600 text-white border-indigo-600' 
                        : 'border-gray-300 text-gray-700 hover:bg-indigo-50'
                    }`}
                    onClick={() => handleAnswerSelect(index)}
                  >
                    <span className="font-semibold mr-3">
                      {String.fromCharCode(65 + index)})
                    </span>
                    {option}
                  </Button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null || submitLoading}
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
                  className="flex-1 text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                >
                  {skipLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                  ) : (
                    <ArrowRight className="mr-2 h-4 w-4" />
                  )}
                  Skip Question
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Completion Phase
  if (gamePhase === 'completed') {
    const scoreData = calculateScore(completionTimeMinutes);

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-700">Detective Case Closed! 🕵️</CardTitle>
            <div className="mt-2">
              <Badge variant="outline" className={`text-lg px-4 py-2 ${
                scoreData.performanceRating === 'Excellent' ? 'bg-green-50 text-green-700 border-green-200' :
                scoreData.performanceRating === 'Good' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                scoreData.performanceRating === 'Average' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                'bg-red-50 text-red-700 border-red-200'
              }`}>
                Detective Rating: {scoreData.performanceRating}
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
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Timer className="h-5 w-5 text-indigo-600 mr-2" />
                  <span className="text-lg font-semibold text-indigo-700">Investigation Time</span>
                </div>
                <div className="text-2xl font-bold text-indigo-600">
                  {Math.floor(completionTimeMinutes)}:{String(Math.floor((completionTimeMinutes % 1) * 60)).padStart(2, '0')}
                </div>
                <div className="text-sm text-indigo-600">minutes</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-5 w-5 text-purple-600 mr-2" />
                  <span className="text-lg font-semibold text-purple-700">Accuracy</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {scoreData.accuracy.toFixed(1)}%
                </div>
                <div className="text-sm text-purple-600">correct answers</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-center text-indigo-700 mb-4">Detective Score Breakdown</h3>
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
                    <span className="text-gray-700">Speed Investigation Bonus</span>
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
                  <span className="text-indigo-700">Total Detective Score</span>
                  <span className="text-indigo-700">+{scoreData.totalScore.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => router.push('/levels')}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-lg py-3"
            >
              Continue to Next Level
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}