"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Medal,
  Crown,
  Users,
  RefreshCw,
  ArrowLeft,
  Award,
  Search,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface LeaderboardTeam {
  team_name: string;
  team_code: string;
  score: number;
  current_level: number;
  correct_questions: number;
  incorrect_questions: number;
  skipped_questions: number;
  hint_count: number;
  rank: number;
  total_questions: number;
  accuracy: number;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
}

interface LeaderboardResponse {
  success: boolean;
  data: LeaderboardTeam[];
  total_teams: number;
  last_updated: string;
  error?: string;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<LeaderboardTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState<"all" | "active" | "completed">("all");

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard');
      const data: LeaderboardResponse = await response.json();
      
      if (data.success) {
        setTeams(data.data);
        setLastUpdated(data.last_updated);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch leaderboard data');
        toast.error('Failed to load leaderboard');
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Network error occurred');
      toast.error('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchLeaderboard();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-600 text-white";
      default:
        return "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700";
    }
  };

  const formatLastUpdated = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  // Filter and search teams
  const filteredTeams = teams.filter(team => {
    // Search filter
    const matchesSearch = team.team_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.team_code.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    let matchesFilter = true;
    if (filterBy === "active") {
      matchesFilter = team.current_level > 1 && team.current_level < 40;
    } else if (filterBy === "completed") {
      matchesFilter = team.current_level >= 40;
    }

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-purple-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Trophy className="h-8 w-8 text-purple-600" />
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Leaderboard
                </span>
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Error Loading Leaderboard</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">{error}</p>
            <div className="flex gap-2">
              <Button onClick={fetchLeaderboard} className="flex-1">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
              <Button variant="outline" onClick={() => router.push('/levels')} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-purple-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Leaderboard
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Last updated: {lastUpdated && formatLastUpdated(lastUpdated)}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? "bg-green-50 text-green-700 border-green-200" : ""}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
              </Button>
              <Button variant="outline" onClick={() => router.push('/levels')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Levels
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filter */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search teams by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterBy} onValueChange={(value: "all" | "active" | "completed") => setFilterBy(value)}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter teams" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              <SelectItem value="active">Active Teams</SelectItem>
              <SelectItem value="completed">Completed Teams</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-700">{filteredTeams.length}</div>
              <div className="text-sm text-gray-600">
                {searchTerm || filterBy !== "all" ? "Filtered Teams" : "Total Teams"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-700">
                {filteredTeams.filter(team => team.current_level > 1 && team.current_level < 40).length}
              </div>
              <div className="text-sm text-gray-600">Active Teams</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-700">
                {filteredTeams.length > 0 ? filteredTeams[0].score.toLocaleString() : 0}
              </div>
              <div className="text-sm text-gray-600">Highest Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-700">
                {filteredTeams.length > 0 ? Math.max(...filteredTeams.map(team => team.current_level)) : 0}
              </div>
              <div className="text-sm text-gray-600">Highest Level</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Leaderboard */}
      <main className="container mx-auto px-4 pb-8">
        {(searchTerm || filterBy !== "all") && (
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredTeams.length} of {teams.length} teams
          </div>
        )}
        <div className="space-y-4">
          {filteredTeams.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {teams.length === 0 ? "No Teams Yet" : "No Teams Found"}
                </h3>
                <p className="text-gray-500">
                  {teams.length === 0
                    ? "Teams will appear here once they start playing."
                    : "Try adjusting your search or filter criteria."
                  }
                </p>
                {(searchTerm || filterBy !== "all") && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setFilterBy("all");
                    }}
                    className="mt-4"
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredTeams.map((team) => (
              <Card 
                key={team.team_code} 
                className={`transition-all duration-200 hover:scale-[1.01] ${
                  team.rank <= 3 ? 'ring-2 ring-opacity-50' : ''
                } ${
                  team.rank === 1 ? 'ring-yellow-400 bg-gradient-to-r from-yellow-50 to-amber-50' :
                  team.rank === 2 ? 'ring-gray-400 bg-gradient-to-r from-gray-50 to-slate-50' :
                  team.rank === 3 ? 'ring-amber-400 bg-gradient-to-r from-amber-50 to-orange-50' :
                  'hover:bg-gray-50'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Rank */}
                      <div className="flex items-center justify-center w-12 h-12">
                        {getRankIcon(team.rank)}
                      </div>
                      
                      {/* Team Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-800">{team.team_name}</h3>
                          <Badge 
                            variant="outline" 
                            className={`font-mono text-xs ${getRankBadgeColor(team.rank)}`}
                          >
                            {team.team_code}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Level:</span>
                            <span className="ml-1 font-semibold">{team.current_level}/40</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Correct:</span>
                            <span className="ml-1 font-semibold text-green-600">{team.correct_questions}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Incorrect:</span>
                            <span className="ml-1 font-semibold text-red-600">{team.incorrect_questions}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Hints:</span>
                            <span className="ml-1 font-semibold text-blue-600">{team.hint_count}</span>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>{team.completion_percentage}% complete</span>
                          </div>
                          <Progress value={team.completion_percentage} className="h-2" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Score */}
                    <div className="text-right">
                      <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {team.score.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">points</div>
                      {team.accuracy > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {team.accuracy}% accuracy
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
