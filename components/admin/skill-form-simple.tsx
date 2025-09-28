"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import type { Skill, SkillType, CategoryType } from "@/lib/database/queries";
import type { CreateSkillData, UpdateSkillData } from "@/lib/database/admin-queries";

interface SkillFormProps {
  skill?: Skill;
  availableSkills: Skill[];
  onSubmit: (data: CreateSkillData | UpdateSkillData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const SKILL_TYPES: SkillType[] = ['Regular', 'Milestone', 'Variation'];
const CATEGORIES: CategoryType[] = ['Push', 'Pull', 'Legs'];

export function SkillForm({ skill, availableSkills, onSubmit, onCancel, isLoading }: SkillFormProps) {
  const [formData, setFormData] = useState({
    name: skill?.name || '',
    difficulty: skill?.difficulty || 1,
    type: skill?.type || 'Regular' as SkillType,
    category: skill?.category || 'Push' as CategoryType,
    description: skill?.description || '',
    previous_skills: skill?.previous_skills || [],
    next_skills: skill?.next_skills || [],
    variations: skill?.variations || []
  });

  // States for managing skill relationships
  const [selectedPreviousSkill, setSelectedPreviousSkill] = useState('');
  const [selectedNextSkill, setSelectedNextSkill] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = skill 
      ? { ...formData, id: skill.id } as UpdateSkillData
      : formData as CreateSkillData;
    
    await onSubmit(submitData);
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'bg-green-100 text-green-800';
    if (difficulty <= 4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  // Helper functions for managing skill relationships
  const addPreviousSkill = () => {
    if (selectedPreviousSkill && !formData.previous_skills.includes(selectedPreviousSkill)) {
      // For this implementation, we'll allow only one previous skill
      setFormData(prev => ({ 
        ...prev, 
        previous_skills: [selectedPreviousSkill] 
      }));
      setSelectedPreviousSkill('');
    }
  };

  const removePreviousSkill = (skillId: string) => {
    setFormData(prev => ({
      ...prev,
      previous_skills: prev.previous_skills.filter(id => id !== skillId)
    }));
  };

  const addNextSkill = () => {
    if (selectedNextSkill && !formData.next_skills.includes(selectedNextSkill)) {
      setFormData(prev => ({ 
        ...prev, 
        next_skills: [...prev.next_skills, selectedNextSkill] 
      }));
      setSelectedNextSkill('');
    }
  };

  const removeNextSkill = (skillId: string) => {
    setFormData(prev => ({
      ...prev,
      next_skills: prev.next_skills.filter(id => id !== skillId)
    }));
  };

  // Get available skills (excluding current skill)
  const getAvailableSkills = () => {
    return availableSkills.filter(s => s.id !== skill?.id);
  };

  // Get available previous skills (should be lower or equal difficulty)
  const getAvailablePreviousSkills = () => {
    return getAvailableSkills().filter(s => 
      s.difficulty <= formData.difficulty && 
      s.category === formData.category &&
      !formData.previous_skills.includes(s.id)
    );
  };

  // Get available next skills (should be higher or equal difficulty)
  const getAvailableNextSkills = () => {
    return getAvailableSkills().filter(s => 
      s.difficulty >= formData.difficulty && 
      s.category === formData.category &&
      !formData.next_skills.includes(s.id)
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{skill ? 'Edit Skill' : 'Create New Skill'}</CardTitle>
        <CardDescription>
          {skill ? 'Update the skill details below' : 'Add a new skill to the database'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Skill Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Standard Push-up"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="difficulty">Difficulty Level (1-10)</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="difficulty"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.difficulty}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty: parseInt(e.target.value) }))}
                  required
                />
                <Badge className={getDifficultyColor(formData.difficulty)}>
                  Level {formData.difficulty}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Skill Type</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as SkillType }))}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                {SKILL_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as CategoryType }))}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the skill, technique, or requirements..."
              rows={3}
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Skill Relationships */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Skill Relationships</h3>
              <p className="text-sm text-muted-foreground">
                Define skill progression by setting prerequisite and follow-up skills.
              </p>
            </div>

            {/* Previous Skills (Prerequisites) */}
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Previous Skill (Prerequisite)</Label>
                <p className="text-xs text-muted-foreground">
                  Select one skill that must be completed before this skill. Should be same category and equal/lower difficulty.
                </p>
              </div>
              
              {/* Current Previous Skills */}
              {formData.previous_skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.previous_skills.map(skillId => {
                    const skill = availableSkills.find(s => s.id === skillId);
                    return skill ? (
                      <Badge key={skillId} variant="secondary" className="flex items-center gap-2">
                        {skill.name} (Level {skill.difficulty})
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-red-600" 
                          onClick={() => removePreviousSkill(skillId)}
                        />
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}

              {/* Add Previous Skill */}
              {formData.previous_skills.length === 0 && (
                <div className="flex gap-2">
                  <select
                    value={selectedPreviousSkill}
                    onChange={(e) => setSelectedPreviousSkill(e.target.value)}
                    className="flex h-9 flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Select a prerequisite skill...</option>
                    {getAvailablePreviousSkills().map(skill => (
                      <option key={skill.id} value={skill.id}>
                        {skill.name} (Level {skill.difficulty})
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPreviousSkill}
                    disabled={!selectedPreviousSkill}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Next Skills (Follow-ups) */}
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Next Skills (Follow-ups)</Label>
                <p className="text-xs text-muted-foreground">
                  Select skills that become available after completing this skill. Should be same category and equal/higher difficulty.
                </p>
              </div>
              
              {/* Current Next Skills */}
              {formData.next_skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.next_skills.map(skillId => {
                    const skill = availableSkills.find(s => s.id === skillId);
                    return skill ? (
                      <Badge key={skillId} variant="secondary" className="flex items-center gap-2">
                        {skill.name} (Level {skill.difficulty})
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-red-600" 
                          onClick={() => removeNextSkill(skillId)}
                        />
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}

              {/* Add Next Skill */}
              <div className="flex gap-2">
                <select
                  value={selectedNextSkill}
                  onChange={(e) => setSelectedNextSkill(e.target.value)}
                  className="flex h-9 flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Select a follow-up skill...</option>
                  {getAvailableNextSkills().map(skill => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name} (Level {skill.difficulty})
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addNextSkill}
                  disabled={!selectedNextSkill}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (skill ? 'Update Skill' : 'Create Skill')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}