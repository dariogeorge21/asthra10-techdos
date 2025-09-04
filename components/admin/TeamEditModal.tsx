"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Team } from "@/lib/supabase";

interface TeamEditModalProps {
  team: Team | null;
  isOpen: boolean;
  onClose: () => void;
  onTeamUpdated: (updatedTeam: Team) => void;
}

interface FormData {
  team_name: string;
  score: number;
  game_loaded: boolean;
  checkpoint_score: number;
  checkpoint_level: number;
  current_level: number;
  correct_questions: number;
  incorrect_questions: number;
  skipped_questions: number;
  hint_count: number;
}

interface FormErrors {
  [key: string]: string;
}

export function TeamEditModal({ team, isOpen, onClose, onTeamUpdated }: TeamEditModalProps) {
  const [formData, setFormData] = useState<FormData>({
    team_name: "",
    score: 0,
    game_loaded: false,
    checkpoint_score: 0,
    checkpoint_level: 1,
    current_level: 1,
    correct_questions: 0,
    incorrect_questions: 0,
    skipped_questions: 0,
    hint_count: 0,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when team changes
  useEffect(() => {
    if (team) {
      setFormData({
        team_name: team.team_name,
        score: team.score,
        game_loaded: team.game_loaded,
        checkpoint_score: team.checkpoint_score,
        checkpoint_level: team.checkpoint_level,
        current_level: team.current_level,
        correct_questions: team.correct_questions,
        incorrect_questions: team.incorrect_questions,
        skipped_questions: team.skipped_questions,
        hint_count: team.hint_count,
      });
      setErrors({});
    }
  }, [team]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate team_name
    if (!formData.team_name.trim()) {
      newErrors.team_name = "Team name is required";
    } else if (formData.team_name.trim().length > 100) {
      newErrors.team_name = "Team name must be less than 100 characters";
    }

    // Validate current_level
    if (formData.current_level < 1 || formData.current_level > 40) {
      newErrors.current_level = "Current level must be between 1 and 40";
    }

    // Validate checkpoint_level
    if (formData.checkpoint_level < 1 || formData.checkpoint_level > 40) {
      newErrors.checkpoint_level = "Checkpoint level must be between 1 and 40";
    }

    // Validate non-negative fields
    if (formData.correct_questions < 0) {
      newErrors.correct_questions = "Correct questions must be non-negative";
    }
    if (formData.incorrect_questions < 0) {
      newErrors.incorrect_questions = "Incorrect questions must be non-negative";
    }
    if (formData.skipped_questions < 0) {
      newErrors.skipped_questions = "Skipped questions must be non-negative";
    }
    if (formData.hint_count < 0) {
      newErrors.hint_count = "Hint count must be non-negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!team || !validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/teams/${team.team_code}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Team "${formData.team_name}" updated successfully!`);
        onTeamUpdated(result.team);
        onClose();
      } else {
        const error = await response.json();
        if (error.details && Array.isArray(error.details)) {
          toast.error(`Validation failed: ${error.details.join(', ')}`);
        } else {
          toast.error(error.error || "Failed to update team");
        }
      }
    } catch (error) {
      console.error('Error updating team:', error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setErrors({});
      onClose();
    }
  };

  if (!team) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Team: {team.team_name}</DialogTitle>
          <DialogDescription>
            Update team information. Team code ({team.team_code}) cannot be changed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Team Name */}
            <div className="md:col-span-2">
              <Label htmlFor="team_name">Team Name *</Label>
              <Input
                id="team_name"
                value={formData.team_name}
                onChange={(e) => handleInputChange('team_name', e.target.value)}
                className={errors.team_name ? "border-red-500" : ""}
                disabled={isSubmitting}
              />
              {errors.team_name && (
                <p className="text-sm text-red-500 mt-1">{errors.team_name}</p>
              )}
            </div>

            {/* Score */}
            <div>
              <Label htmlFor="score">Score</Label>
              <Input
                id="score"
                type="number"
                value={formData.score}
                onChange={(e) => handleInputChange('score', parseInt(e.target.value) || 0)}
                disabled={isSubmitting}
              />
            </div>

            {/* Current Level */}
            <div>
              <Label htmlFor="current_level">Current Level (1-40) *</Label>
              <Input
                id="current_level"
                type="number"
                min="1"
                max="40"
                value={formData.current_level}
                onChange={(e) => handleInputChange('current_level', parseInt(e.target.value) || 1)}
                className={errors.current_level ? "border-red-500" : ""}
                disabled={isSubmitting}
              />
              {errors.current_level && (
                <p className="text-sm text-red-500 mt-1">{errors.current_level}</p>
              )}
            </div>

            {/* Checkpoint Score */}
            <div>
              <Label htmlFor="checkpoint_score">Checkpoint Score</Label>
              <Input
                id="checkpoint_score"
                type="number"
                value={formData.checkpoint_score}
                onChange={(e) => handleInputChange('checkpoint_score', parseInt(e.target.value) || 0)}
                disabled={isSubmitting}
              />
            </div>

            {/* Checkpoint Level */}
            <div>
              <Label htmlFor="checkpoint_level">Checkpoint Level (1-40) *</Label>
              <Input
                id="checkpoint_level"
                type="number"
                min="1"
                max="40"
                value={formData.checkpoint_level}
                onChange={(e) => handleInputChange('checkpoint_level', parseInt(e.target.value) || 1)}
                className={errors.checkpoint_level ? "border-red-500" : ""}
                disabled={isSubmitting}
              />
              {errors.checkpoint_level && (
                <p className="text-sm text-red-500 mt-1">{errors.checkpoint_level}</p>
              )}
            </div>

            {/* Correct Questions */}
            <div>
              <Label htmlFor="correct_questions">Correct Questions</Label>
              <Input
                id="correct_questions"
                type="number"
                min="0"
                value={formData.correct_questions}
                onChange={(e) => handleInputChange('correct_questions', parseInt(e.target.value) || 0)}
                className={errors.correct_questions ? "border-red-500" : ""}
                disabled={isSubmitting}
              />
              {errors.correct_questions && (
                <p className="text-sm text-red-500 mt-1">{errors.correct_questions}</p>
              )}
            </div>

            {/* Incorrect Questions */}
            <div>
              <Label htmlFor="incorrect_questions">Incorrect Questions</Label>
              <Input
                id="incorrect_questions"
                type="number"
                min="0"
                value={formData.incorrect_questions}
                onChange={(e) => handleInputChange('incorrect_questions', parseInt(e.target.value) || 0)}
                className={errors.incorrect_questions ? "border-red-500" : ""}
                disabled={isSubmitting}
              />
              {errors.incorrect_questions && (
                <p className="text-sm text-red-500 mt-1">{errors.incorrect_questions}</p>
              )}
            </div>

            {/* Skipped Questions */}
            <div>
              <Label htmlFor="skipped_questions">Skipped Questions</Label>
              <Input
                id="skipped_questions"
                type="number"
                min="0"
                value={formData.skipped_questions}
                onChange={(e) => handleInputChange('skipped_questions', parseInt(e.target.value) || 0)}
                className={errors.skipped_questions ? "border-red-500" : ""}
                disabled={isSubmitting}
              />
              {errors.skipped_questions && (
                <p className="text-sm text-red-500 mt-1">{errors.skipped_questions}</p>
              )}
            </div>

            {/* Hint Count */}
            <div>
              <Label htmlFor="hint_count">Hint Count</Label>
              <Input
                id="hint_count"
                type="number"
                min="0"
                value={formData.hint_count}
                onChange={(e) => handleInputChange('hint_count', parseInt(e.target.value) || 0)}
                className={errors.hint_count ? "border-red-500" : ""}
                disabled={isSubmitting}
              />
              {errors.hint_count && (
                <p className="text-sm text-red-500 mt-1">{errors.hint_count}</p>
              )}
            </div>

            {/* Game Loaded */}
            <div className="md:col-span-2 flex items-center space-x-2">
              <Checkbox
                id="game_loaded"
                checked={formData.game_loaded}
                onCheckedChange={(checked) => handleInputChange('game_loaded', checked as boolean)}
                disabled={isSubmitting}
              />
              <Label htmlFor="game_loaded">Game Loaded (Team has started the game)</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isSubmitting ? "Updating..." : "Update Team"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
