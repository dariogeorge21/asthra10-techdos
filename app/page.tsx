"use client";

import { useState } from "react";
import { Clock, Users, Trophy, Zap, Timer, Shield, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Home() {
  const [teamName, setTeamName] = useState("");

  const handleStartChallenge = () => {
    if (teamName.trim()) {
      // Navigate to the challenge or handle team registration
      console.log("Starting challenge with team:", teamName);
      // You can add navigation logic here
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              TechDOS
            </span>
          </div>
          <Badge variant="secondary" className="bg-gradient-to-r from-orange-100 to-pink-100 text-orange-600 border-orange-200">
            September 19, 2024
          </Badge>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            5-Hour Technical Challenge
          </Badge>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
            The Chronos Cypher
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
            Welcome to <strong className="text-purple-600">The Chronos Cypher</strong>, a 40-level challenge designed to test your 
            <span className="text-pink-600"> problem-solving</span>, <span className="text-orange-500">technical skills</span>, 
            and <span className="text-purple-600">teamwork</span> against the clock.
          </p>

          <Alert className="max-w-2xl mx-auto mb-8 border-orange-200 bg-gradient-to-r from-orange-50 to-pink-50">
            <Zap className="h-4 w-4 text-orange-500" />
            <AlertDescription className="text-orange-700">
              The first 30 levels are offline to test your core knowledge. Internet access will be enabled for the final, more complex stages. Good luck.
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Event Details */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-700">
                <Trophy className="h-5 w-5" />
                <span>Objective</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">Complete all 40 levels first, or solve the most levels within 5 hours to win.</p>
            </CardContent>
          </Card>

          <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-pink-700">
                <Timer className="h-5 w-5" />
                <span>Event Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-gray-700"><strong>Date:</strong> 19th September</p>
              <p className="text-gray-700"><strong>Time:</strong> 10:00 AM - 3:00 PM</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-orange-700">
                <Users className="h-5 w-5" />
                <span>Team Structure</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-gray-700"><strong>Max Teams:</strong> 10</p>
              <p className="text-gray-700"><strong>Team Size:</strong> 3-4 members</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Rules Section */}
      <section className="container mx-auto px-4 py-12">
        <Card className="max-w-4xl mx-auto border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-purple-700 flex items-center justify-center space-x-2">
              <Shield className="h-8 w-8" />
              <span>Rules</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Badge className="bg-purple-500 hover:bg-purple-600 mt-1">1</Badge>
                  <p className="text-gray-700">Maximum of 10 teams.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge className="bg-pink-500 hover:bg-pink-600 mt-1">2</Badge>
                  <p className="text-gray-700">Each team must have 3-4 members.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge className="bg-orange-500 hover:bg-orange-600 mt-1">3</Badge>
                  <p className="text-gray-700">The game has 40 levels of puzzles and tasks.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge className="bg-red-500 hover:bg-red-600 mt-1">4</Badge>
                  <p className="text-gray-700">Tampering with clues will result in disqualification.</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Badge className="bg-blue-500 hover:bg-blue-600 mt-1">5</Badge>
                  <p className="text-gray-700">Use of the internet is prohibited unless specified in a clue.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge className="bg-green-500 hover:bg-green-600 mt-1">6</Badge>
                  <p className="text-gray-700">The first team to finish within the rules wins.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge className="bg-yellow-500 hover:bg-yellow-600 mt-1">7</Badge>
                  <p className="text-gray-700">If no team finishes, the team with the most solved levels wins.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge className="bg-gray-500 hover:bg-gray-600 mt-1">8</Badge>
                  <p className="text-gray-700">Respect organizers, other teams, and all safety rules.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Scoring Section */}
      <section className="container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto border-2 border-pink-200 bg-gradient-to-br from-white to-pink-50">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-pink-700 flex items-center justify-center space-x-2">
              <Star className="h-8 w-8" />
              <span>Scoring</span>
            </CardTitle>
            <CardDescription className="text-center text-lg text-gray-600">
              Your score is based on:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                <Timer className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-green-700 mb-2">Time</h3>
                <p className="text-sm text-gray-600">Faster completion of levels scores higher.</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200">
                <Zap className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
                <h3 className="font-semibold text-yellow-700 mb-2">Hints</h3>
                <p className="text-sm text-gray-600">Using hints will reduce your score.</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-red-50 to-pink-50 border border-red-200">
                <Shield className="h-12 w-12 text-red-600 mx-auto mb-3" />
                <h3 className="font-semibold text-red-700 mb-2">Reverts</h3>
                <p className="text-sm text-gray-600">Failing a level and reverting to a checkpoint will reduce your score.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Challenge Entry */}
      <section className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto border-4 border-gradient-to-r from-purple-300 to-pink-300 bg-gradient-to-br from-white to-purple-50 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-4xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Begin the Challenge
            </CardTitle>
            <CardDescription className="text-center text-lg text-gray-600">
              Enter your team name below to start.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Input
                placeholder="Enter your team name..."
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="text-lg py-6 border-2 border-purple-200 focus:border-purple-400 bg-white"
              />
              <Button
                onClick={handleStartChallenge}
                disabled={!teamName.trim()}
                className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400"
              >
                Start Challenge
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            
            <Separator className="bg-gradient-to-r from-purple-200 to-pink-200" />
            
            <div className="text-center text-sm text-gray-500">
              <p>Ready to test your limits? The clock starts ticking once you begin!</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center">
        <div className="flex items-center justify-center space-x-2 text-gray-500">
          <Clock className="h-4 w-4" />
          <span>May the best team win! Good luck challengers.</span>
        </div>
      </footer>
    </div>
  );
}