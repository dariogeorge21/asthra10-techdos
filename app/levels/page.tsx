"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, Trophy, Lock, CheckCircle, Play, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Team, getGameTimeRemaining, formatTimeRemaining, getGameTimerStatus } from "@/lib/supabase";

export default function LevelsPage() {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [timerStatus, setTimerStatus] = useState<'not_started' | 'active' | 'expired'>('not_started');
  const router = useRouter();

  useEffect(() => {
    const teamCode = localStorage.getItem('team_code');
    if (!teamCode) {
      toast.error("No team code found. Please start from the home page.");
      router.push('/');
      return;
    }

    fetchTeamData(teamCode);
  }, [router]);

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

  const fetchTeamData = async (teamCode: string) => {
    try {
      const response = await fetch(`/api/teams/${teamCode}`);
      if (!response.ok) {
        throw new Error('Failed to fetch team data');
      }
      const teamData = await response.json();
      setTeam(teamData);

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

  const getLevelStatus = (levelNumber: number) => {
    if (!team) return 'locked';
    if (levelNumber < team.current_level) return 'completed';
    if (levelNumber === team.current_level) return 'current';
    return 'locked';
  };

  const getLevelIcon = (levelNumber: number) => {
    const status = getLevelStatus(levelNumber);
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'current':
        return <Play className="h-6 w-6 text-blue-500" />;
      default:
        return <Lock className="h-6 w-6 text-gray-400" />;
    }
  };

  const handleLevelClick = (levelNumber: number) => {
    const status = getLevelStatus(levelNumber);
    if (status === 'locked') {
      toast.error("This level is locked. Complete previous levels first.");
      return;
    }
    
    router.push(`/levels/level-${levelNumber}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your challenge...</p>
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

  const progress = ((team.current_level - 1) / 40) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header with Timer and Score */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-purple-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-6 w-6 text-purple-600" />
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {team.team_name}
                </span>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Level {team.current_level}/40
              </Badge>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  <span className="text-lg font-semibold text-gray-800">
                    {team.score.toLocaleString()} pts
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <Timer className={`h-5 w-5 ${timerStatus === 'not_started' ? 'text-gray-500' : 'text-red-600'}`} />
                  <span className={`text-lg font-mono font-semibold ${getTimerDisplay().className}`}>
                    {getTimerDisplay().text}
                  </span>
                </div>
                {timerStatus === 'not_started' && (
                  <div className="text-xs text-gray-400 mt-1">
                    Timer will start when game begins
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{team.current_level - 1}/40 levels completed</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </header>

      {/* Levels Grid */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-4">
          {Array.from({ length: 40 }, (_, i) => i + 1).map((levelNumber) => {
            const status = getLevelStatus(levelNumber);
            const isCheckpoint = [1, 5, 10, 15, 20, 25, 30, 35].includes(levelNumber);
            
            return (
              <Card
                key={levelNumber}
                className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                  status === 'completed'
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:border-green-300'
                    : status === 'current'
                    ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-300 ring-2 ring-blue-200'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                } ${isCheckpoint ? 'ring-2 ring-yellow-300' : ''}`}
                onClick={() => handleLevelClick(levelNumber)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    {getLevelIcon(levelNumber)}
                    {isCheckpoint && (
                      <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">
                        CP
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardTitle className="text-center text-lg">
                    {levelNumber}
                  </CardTitle>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-12 grid md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-700">{team.correct_questions}</div>
              <div className="text-sm text-green-600">Correct Answers</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-red-700">{team.incorrect_questions}</div>
              <div className="text-sm text-red-600">Incorrect Answers</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-yellow-700">{team.skipped_questions}</div>
              <div className="text-sm text-yellow-600">Skipped Questions</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-700">{team.hint_count}</div>
              <div className="text-sm text-blue-600">Hints Used</div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
