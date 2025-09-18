"use client";

import { useState, useEffect } from "react";

import { Shield, Users, Trash2, Plus, Eye, LogOut, Edit, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Team, getGameTimerStatus, formatTimeRemaining, getGameTimeRemaining } from "@/lib/supabase";
import { TeamEditModal } from "@/components/admin/TeamEditModal";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [newTeamName, setNewTeamName] = useState("");
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTeams();
    }
  }, [isAuthenticated]);

  const checkAuthStatus = async () => {
    try {
      // Check if admin session exists by trying to fetch teams
      const response = await fetch('/api/admin/teams');
      if (response.ok) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        toast.success("Login successful!");
        fetchTeams();
      } else {
        const error = await response.json();
        toast.error(error.error || "Login failed");
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setTeams([]);
      toast.success("Logged out successfully");
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/admin/teams');
      if (response.ok) {
        const teamsData = await response.json();
        setTeams(teamsData);
      } else {
        toast.error("Failed to fetch teams");
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast.error("Error fetching teams");
    }
  };

  const createTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    setIsCreatingTeam(true);

    try {
      const response = await fetch('/api/admin/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_name: newTeamName.trim() }),
      });

      if (response.ok) {
        const newTeam = await response.json();
        setTeams([...teams, newTeam]);
        setNewTeamName("");
        toast.success(`Team "${newTeam.team_name}" created with code: ${newTeam.team_code}`);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create team");
      }
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error("Error creating team");
    } finally {
      setIsCreatingTeam(false);
    }
  };

  const deleteTeam = async (teamCode: string, teamName: string) => {
    try {
      const response = await fetch(`/api/admin/teams/${teamCode}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTeams(teams.filter(team => team.team_code !== teamCode));
        toast.success(`Team "${teamName}" deleted successfully`);
      } else {
        toast.error("Failed to delete team");
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error("Error deleting team");
    }
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTeam(null);
  };

  const handleTeamUpdated = (updatedTeam: Team) => {
    setTeams(teams.map(team =>
      team.team_code === updatedTeam.team_code ? updatedTeam : team
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (team: Team) => {
    if (!team.game_loaded) {
      return <Badge variant="secondary">Not Started</Badge>;
    } else if (team.current_level >= 40) {
      return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
    } else {
      return <Badge className="bg-blue-500 hover:bg-blue-600">In Progress</Badge>;
    }
  };

  const getTimerStatusBadge = (team: Team) => {
    const status = getGameTimerStatus(team);
    const remaining = getGameTimeRemaining(team);

    switch (status) {
      case 'not_started':
        return <Badge variant="outline" className="text-gray-600">Timer: Not Started</Badge>;
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            Timer: {formatTimeRemaining(remaining)}
          </Badge>
        );
      case 'expired':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Timer: Expired</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
            <CardDescription>
              Enter your credentials to access the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Admin Panel
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => window.open('/leaderboard', '_blank')}
                className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:from-purple-100 hover:to-pink-100"
              >
                <Trophy className="mr-2 h-4 w-4" />
                Leaderboard
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-700">{teams.length}</div>
                <div className="text-sm text-gray-600">Total Teams</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-700">
                  {teams.filter(team => team.game_loaded).length}
                </div>
                <div className="text-sm text-gray-600">Active Teams</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-700">
                  {teams.filter(team => team.current_level >= 40).length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-orange-700">
                  {teams.length > 0 ? Math.max(...teams.map(team => team.score)) : 0}
                </div>
                <div className="text-sm text-gray-600">Highest Score</div>
              </CardContent>
            </Card>
          </div>

          {/* Teams Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Teams Management</span>
                  </CardTitle>
                  <CardDescription>
                    Manage participating teams and monitor their progress
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Team
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Team</DialogTitle>
                      <DialogDescription>
                        Enter the team name to generate a unique team code.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={createTeam} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="teamName">Team Name</Label>
                        <Input
                          id="teamName"
                          value={newTeamName}
                          onChange={(e) => setNewTeamName(e.target.value)}
                          placeholder="Enter team name..."
                          required
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={isCreatingTeam}
                      >
                        {isCreatingTeam ? "Creating..." : "Create Team"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team Name</TableHead>
                    <TableHead>Team Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Timer</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams.map((team) => (
                    <TableRow key={team.team_code}>
                      <TableCell className="font-medium">{team.team_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {team.team_code}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(team)}</TableCell>
                      <TableCell>{getTimerStatusBadge(team)}</TableCell>
                      <TableCell>{team.current_level}/40</TableCell>
                      <TableCell>{team.score.toLocaleString()}</TableCell>
                      <TableCell>{formatDate(team.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Show team details
                              toast.info(`Team: ${team.team_name}\nCode: ${team.team_code}\nCorrect: ${team.correct_questions}\nIncorrect: ${team.incorrect_questions}\nSkipped: ${team.skipped_questions}\nHints: ${team.hint_count}`);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTeam(team)}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Team</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete team &quot;{team.team_name}&quot;? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteTeam(team.team_code, team.team_name)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {teams.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No teams created yet. Create your first team to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Team Edit Modal */}
      <TeamEditModal
        team={editingTeam}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onTeamUpdated={handleTeamUpdated}
      />
    </div>
  );
}
