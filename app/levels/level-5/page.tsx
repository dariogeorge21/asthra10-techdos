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
  Lightbulb,
  SkipForward,
  Eye,
  EyeOff,
  HelpCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { getGameTimeRemaining, getGameTimerStatus, formatTimeRemaining } from '@/lib/supabase';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  hint: string;
  category: string;
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

export default function Level5Page() {
  const router = useRouter();
  
  // Game state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [skipLoading, setSkipLoading] = useState(false);
  
  // Team and stats
  const [team, setTeam] = useState<Team | null>(null);
  const [levelStats, setLevelStats] = useState({
    correct: 0,
    incorrect: 0,
    skipped: 0,
    hintsUsed: 0
  });
  const [initialTeamStats, setInitialTeamStats] = useState<TeamStats | null>(null);
  
  // Timer
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerStatus, setTimerStatus] = useState<'not_started' | 'active' | 'expired'>('not_started');
  const [levelStartTime] = useState(new Date());
  const [completionTimeMinutes, setCompletionTimeMinutes] = useState(0);

  // Questions data
  const questions: Question[] = [
    {
      id: 1,
      question: 'Who is known as the "Missile Man of India"?',
      options: ['Dr. A. P. J. Abdul Kalam', 'Dr. Vikram Sarabhai', 'Dr. Homi Bhabha', 'Dr. C. V. Raman'],
      correctAnswer: 'Dr. A. P. J. Abdul Kalam',
      hint: 'This scientist later became the 11th President of India and was instrumental in India\'s missile development program.',
      category: 'Science & Politics'
    },
    {
      id: 2,
      question: 'The Netflix series Money Heist is originally from which country?',
      options: ['Italy', 'Mexico','Spain', 'Brazil'],
      correctAnswer: 'Spain',
      hint: 'This European country is famous for flamenco dancing and the running of the bulls in Pamplona.',
      category: 'Entertainment'
    },
    {
      id: 3,
      question: 'In cricket, who was the first bowler to take 10 wickets in a single Test innings?',
      options: ['Shane Warne', 'Muttiah Muralitharan','Jim Laker', 'Anil Kumble'],
      correctAnswer: 'Jim Laker',
      hint: 'This English off-spinner achieved this feat in 1956 against Australia at Old Trafford, Manchester.',
      category: 'Sports'
    },
    {
      id: 4,
      question: 'Kerala\'s state bird, known for its striking blue and orange plumage, is?',
      options: ['Indian Peacock', 'Kingfisher','Great Hornbill', 'Malabar Parakeet'],
      correctAnswer: 'Great Hornbill',
      hint: 'This large bird has a distinctive casque on top of its massive bill and is found in the Western Ghats.',
      category: 'Nature'
    },
    {
      id: 5,
      question: 'Which is the only country that has won the FIFA World Cup on four different continents?',
      options: ['Brazil', 'Germany', 'Argentina','None'],
      correctAnswer: 'None',
      hint: 'Consider where the FIFA World Cup has been hosted and which countries have claimed titles across those locations.',
      category: 'Sports'
    },
    {
      id: 6,
      question: 'Who was the last Governor-General of independent India?',
      options: ['Lord Mountbatten', 'Dr. Rajendra Prasad','C. Rajagopalachari','Jawaharlal Nehru'],
      correctAnswer: 'C. Rajagopalachari',
      hint: 'This Indian leader took over from Lord Mountbatten and served until India became a republic in 1950.',
      category: 'History'
    },
    {
      id: 7,
      question: 'Microsoft\'s first-ever hardware product wasn\'t a console or a PC. What was it?',
      options: ['Mouse', 'Keyboard', 'Monitor', 'Printer'],
      correctAnswer: 'Mouse',
      hint: 'Released in 1983, this pointing device was Microsoft\'s entry into hardware manufacturing.',
      category: 'Technology'
    },
    {
      id: 8,
      question: 'If planets had "reverse gears," which one rotates backward compared to most others?',
      options: ['Mars', 'Jupiter','Venus', 'Saturn'],
      correctAnswer: 'Venus',
      hint: 'This planet is the hottest in our solar system and rotates in the opposite direction to most other planets.',
      category: 'Science'
    },
    {
      id: 9,
      question: 'Which Indian city is famous for its Chand Baori stepwell?',
      options: ['Jaipur','Abhaneri', 'Udaipur', 'Jodhpur'],
      correctAnswer: 'Abhaneri',
      hint: 'This ancient stepwell is located in Rajasthan and has over 3,500 narrow steps arranged in perfect symmetry.',
      category: 'Architecture'
    },
    {
      id: 10,
      question: 'The Golden Boot winner of FIFA 2022, scoring 8 goals, was?',
      options: ['Lionel Messi', 'Harry Kane','Kylian Mbappé', 'Olivier Giroud'],
      correctAnswer: 'Kylian Mbappé',
      hint: 'This French striker scored a hat-trick in the final but still ended up on the losing side.',
      category: 'Sports'
    },
    {
      id: 11,
      question: 'In Kerala, the famous hill station Munnar is located in which district?',
      options: ['Wayanad', 'Kottayam', 'Pathanamthitta','Idukki'],
      correctAnswer: 'Idukki',
      hint: 'This district is known for its spice plantations and is home to the Periyar Wildlife Sanctuary.',
      category: 'Geography'
    },
    {
      id: 12,
      question: 'Which countries are hosting FIFA 2026?',
      options: ['US, Mexico and Canada', 'Qatar and UAE', 'Spain and Portugal', 'Argentina and Uruguay'],
      correctAnswer: 'US, Mexico and Canada',
      hint: 'This will be the first World Cup hosted by three countries and the first in North America since 1994.',
      category: 'Sports'
    },
    {
      id: 13,
      question: 'Who wrote the Indian national anthem "Jana Gana Mana"?',
      options: ['Bankim Chandra Chatterjee', 'Sarojini Naidu','Rabindranath Tagore', 'Subhas Chandra Bose'],
      correctAnswer: 'Rabindranath Tagore',
      hint: 'This Nobel Prize-winning poet also composed the national anthem of Bangladesh.',
      category: 'Literature'
    },
    {
      id: 14,
      question: 'The internet\'s first viral dance challenge, the "Harlem Shake," exploded in which year?',
      options: ['2011', '2012', '2014', '2013'],
      correctAnswer: '2013',
      hint: 'This dance craze happened around the same time as the rise of Vine, the short-form video platform.',
      category: 'Internet Culture'
    },
    {
      id: 15,
      question: 'Which Mughal ruler is often called the "Engineer King" for his architectural projects?',
      options: ['Akbar', 'Aurangzeb', 'Humayun','Shah Jahan'],
      correctAnswer: 'Shah Jahan',
      hint: 'This emperor built the Taj Mahal as a mausoleum for his beloved wife Mumtaz Mahal.',
      category: 'History'
    },
    {
      id: 16,
      question: 'If the Sun disappeared, how many minutes would Earth still see sunlight?',
      options: ['10', '7', '4', '8'],
      correctAnswer: '8',
      hint: 'This is the time it takes for light to travel from the Sun to Earth at the speed of light.',
      category: 'Science'
    },
    {
      id: 17,
      question: 'Who was the first Indian to win the World Chess Championship?',
      options: ['Viswanathan Anand', 'Garry Kasparov', 'Magnus Carlsen', 'Vladimir Kramnik'],
      correctAnswer: 'Viswanathan Anand',
      hint: 'Known as the "Lightning Kid," this grandmaster from Tamil Nadu held the world title five times.',
      category: 'Sports'
    },
    {
      id: 18,
      question: 'The Malayalam film Drishyam was remade into how many languages officially?',
      options: ['5', '3', '4', '6'],
      correctAnswer: '4',
      hint: 'This thriller was remade in Hindi, Tamil, Telugu, and Kannada, starring different lead actors.',
      category: 'Entertainment'
    },
    {
      id: 19,
      question: 'Which Greek goddess was believed to have sprung fully grown from the head of Zeus?',
      options: ['Aphrodite', 'Artemis','Athena', 'Hera'],
      correctAnswer: 'Athena',
      hint: 'This goddess of wisdom and warfare is the patron deity of Athens, Greece\'s capital city.',
      category: 'Mythology'
    },
    {
      id: 20,
      question: 'Which Indian athlete is nicknamed the "Flying Sikh"?',
      options: ['Gurbachan Singh Randhawa','Milkha Singh', 'Ajit Pal Singh', 'Balbir Singh Sr.'],
      correctAnswer: 'Milkha Singh',
      hint: 'This legendary sprinter\'s life story was made into a Bollywood film starring Farhan Akhtar.',
      category: 'Sports'
    },
    {
      id: 21,
      question: 'Which Kerala river is known as the Periyar of the South?',
      options: ['Bharathapuzha', 'Pampa River', 'Kabini River','Chaliyar River'],
      correctAnswer: 'Chaliyar River',
      hint: 'This river flows through Kozhikode and Malappuram districts and is important for the region\'s agriculture.',
      category: 'Geography'
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

      if (teamData.current_level < 5) {
        toast.info("You need to complete previous levels first!");
        router.push('/levels');
        return;
      }

      if (teamData.current_level > 5) {
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
    const normalizedInput = input.toLowerCase().trim();
    const normalizedCorrect = correctAnswer.toLowerCase().trim();
    return normalizedInput === normalizedCorrect;
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer.trim()) return;
    
    setSubmitLoading(true);
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = validateAnswer(selectedAnswer, currentQuestion.correctAnswer);
    
    try {
      const newStats = { ...levelStats };
      
      if (isCorrect) {
        newStats.correct++;
      } else {
        newStats.incorrect++;
      }
      
      if (showHint) {
        newStats.hintsUsed++;
      }
      
      setLevelStats(newStats);
      
      if (!team) return;
      
      const updatedStats = {
        correct_questions: team.correct_questions + (isCorrect ? 1 : 0),
        incorrect_questions: team.incorrect_questions + (isCorrect ? 0 : 1),
        hint_count: team.hint_count + (showHint ? 1 : 0)
      };
      
      await updateTeamStats(updatedStats);
      
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer('');
        setShowHint(false);
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
      const newStats = { ...levelStats };
      newStats.skipped++;
      if (showHint) {
        newStats.hintsUsed++;
      }
      setLevelStats(newStats);

      if (!team) return;

      const updatedStats = {
        skipped_questions: team.skipped_questions + 1,
        hint_count: team.hint_count + (showHint ? 1 : 0)
      };

      await updateTeamStats(updatedStats);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer('');
        setShowHint(false);
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

  const handleHint = () => {
    setShowHint(true);
    const newStats = { ...levelStats };
    newStats.hintsUsed++;
    setLevelStats(newStats);
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

    const correctWithoutHints = levelStats.correct - levelStats.hintsUsed;
    const correctWithHints = levelStats.hintsUsed;
    let baseScore = (correctWithoutHints * 1500) + (correctWithHints * 1000);

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

    let performanceRating = "Needs Improvement";
    if (accuracy >= 90 && timeTaken < 2) performanceRating = "Excellent";
    else if (accuracy >= 80 && timeTaken < 3) performanceRating = "Good";
    else if (accuracy >= 70 && timeTaken < 4) performanceRating = "Average";

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
    const newLevel = 6;

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading Level 5...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Trophy className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-700">Level 5 Complete! 🎉</CardTitle>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Timer className="h-5 w-5 text-purple-600 mr-2" />
                  <span className="text-lg font-semibold text-purple-700">Completion Time</span>
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
                  <span className="text-blue-700">Total Score</span>
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
                Level 5
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
                  onClick={handleSubmitAnswer}
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