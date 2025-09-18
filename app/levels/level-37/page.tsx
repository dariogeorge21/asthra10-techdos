

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Team,
  getGameTimeRemaining,
  formatTimeRemaining,
  getGameTimerStatus
} from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { 
    Trophy,
    Timer,
    //  SkipForward,
    // ArrowRight 
    // ,CheckCircle,
    // Target
     } from "lucide-react";

export default function Level37Page() {
  const [team, setTeam] = useState<Team | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [timerStatus, setTimerStatus] = useState<
    "not_started" | "active" | "expired"
  >("not_started");
  const [, setLoading] = useState(true);
  const router = useRouter();

  const fetchTeamData = useCallback(
    async (teamCode: string) => {
      try {
        const response = await fetch(`/api/teams/${teamCode}`);
        console.log(response);
        if (!response.ok) {
          throw new Error("Failed to fetch team data");
        }
        const teamData = await response.json();
        console.log(teamData)
        console.log("Fetched teamData:", teamData);
// console.log("Team state after setTeam:", team);

        setTeam(teamData);
          if (teamData.current_level > 37) {
        toast.info("You've already completed this level!");
        router.push('/levels');
        return;
      }

        const status = getGameTimerStatus(teamData);
        setTimerStatus(status);
        setTimeRemaining(getGameTimeRemaining(teamData));
      } catch (error) {
        console.error("Error fetching team data:", error);
        toast.error("Failed to load team data. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [router]
  );



//   useEffect(()=>{
//   updateTeamStats()
//   },[])

  useEffect(() => {
    const teamCode = localStorage.getItem("team_code");
    if (!teamCode) {
      toast.error("No team code found. Please start from the home page.");
      router.push("/");
      return;
    }

    fetchTeamData(teamCode);

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      return (e.returnValue = "");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [router, fetchTeamData]);

  useEffect(() => {
    if (team) {
      const timer = setInterval(() => {
        const remaining = getGameTimeRemaining(team);
        const status = getGameTimerStatus(team);

        setTimeRemaining(remaining);
        setTimerStatus(status);

        if (status === "expired" && timerStatus !== "expired") {
          toast.error("Time's up! The game has ended.");
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [team, timerStatus]);





  const getTimerDisplay = (): { text: string; className: string } => {
    switch (timerStatus) {
      case "not_started":
        return { text: "Game Not Started", className: "text-gray-500" };
      case "expired":
        return { text: "00:00:00", className: "text-red-600" };
      case "active":
        return {
          text: formatTimeRemaining(timeRemaining),
          className: "text-red-600 font-bold"
        };
      default:
        return { text: "Game Not Started", className: "text-gray-500" };
    }
  };

 

const completeLevel = useCallback( async () => {
  if (!team) return;

  const teamCode = localStorage.getItem("team_code");
  if (!teamCode) return;

  const newTotalScore = team.score + 1000;
  const newLevel = 38;

  try {
    await fetch(`/api/teams/${teamCode}/score`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        score: newTotalScore,
        current_level: newLevel,
      }),
    });

    setTeam({
      ...team,
      score: newTotalScore,
      current_level: newLevel,
    });

    return newLevel;
 
  } catch (error) {
    console.error("Error completing level:", error);
    toast.error("Failed to save progress. Please try again.");
  }
}, [team]);



useEffect(() => {
  if (!team) return;


  if (team.current_level === 37 && !localStorage.getItem("level37Completed")) {
    completeLevel().then((newLevel) => {
      if (newLevel) {
        console.log("Level completed, current_level now:", newLevel);
    
        setTeam(prev => prev ? { ...prev, current_level: newLevel } : prev);
      }
    });
  }
}, [team, completeLevel]);






  // const timerDisplay = getTimerDisplay();

  return (

     <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-purple-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Level 37
              </Badge>
              <span className="text-lg font-semibold text-gray-800">{team && team.team_name}</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <span className="text-lg font-semibold text-gray-800">
                  {team && team.score.toLocaleString()} pts
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Timer className={`h-5 w-5 ${timerStatus === 'not_started' ? 'text-gray-500' : 'text-red-600'}`} />
                <span className={`text-lg font-mono font-semibold ${getTimerDisplay().className}`}>
                  {getTimerDisplay().text}
                  {/* console.log(team); */}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
      {/* <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-purple-700">
            Level 37 
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
         

          <div className="prose prose-purple max-w-none">
            <h3 className="text-lg font-semibold text-purple-600">
              Welcome Challengers!
            </h3>
         <div className="mt-4 space-y-2 text-purple-600 font-bold">
    <p>🎉 Whoa! Congrats, you’ve hit <span className="uppercase">LEVEL 37</span>! 🏆</p>
    <p>We’re ending this epic battle and throwing <span className="text-yellow-500">1000 points</span> at you 💥💰.</p>
    <p>Enjoy the glory and zoom to the next level! 🚀</p>
  </div>
          </div>

          <Button
            onClick={() => router.push('/levels')}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            Continue to Level-38
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </CardContent>
      </Card> */}

        <Card className="max-w-2xl w-full shadow-lg rounded-2xl overflow-hidden">
    <CardHeader className="text-center bg-purple-100 py-4">
      <CardTitle className="text-3xl font-extrabold text-purple-700">
        🎉 Level 37 Unlocked!
      </CardTitle>
 
    </CardHeader>

    <CardContent className="space-y-8 p-6">

      <div className="prose prose-purple max-w-none">
        <h3 className="text-lg font-semibold text-purple-600 mb-3">
          Welcome Challengers!
        </h3>

        <div className="space-y-3 text-purple-700 font-semibold">
          <p className="text-xl">
            🎉 Whoa! Congrats, you’ve hit <span className="uppercase">LEVEL 37</span>! 🏆
          </p>
          <p className="text-lg text-yellow-600">
            We’re ending this epic battle and awarding you <span className="font-bold">1000 points</span> 💥💰.
          </p>
          <p className="text-lg">
            Enjoy the glory and zoom to the next level! 🚀
          </p>
        </div>
      </div>

      {/* Continue Button */}
      <Button
        onClick={() => router.push('/levels')}
        className="w-full py-3 text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-colors rounded-xl flex items-center justify-center"
      >
        Continue to Level-38
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </CardContent>
  </Card>

    </div>
    </div>
  );
}
