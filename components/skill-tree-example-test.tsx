"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllSkillsClient, getCurrentUserProfile, achieveSkillClient, unachieveSkillClient } from "@/lib/database/client-queries";
import type { Skill, UserProfile } from "@/lib/database/queries";

export function SkillTreeExample() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [achievements, setAchievements] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load skills and user profile in parallel
      const [skillsResult, userResult] = await Promise.all([
        getAllSkillsClient(),
        getCurrentUserProfile()
      ]);

      if (skillsResult.data) {
        setSkills(skillsResult.data);
      }

      if (userResult.data) {
        setUser(userResult.data);
        // In a real app, you'd also load user achievements here
        // For now, we'll just show the pattern
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkillToggle = async (skillId: string) => {
    if (!user) return;

    const isAchieved = achievements.has(skillId);
    
    try {
      if (isAchieved) {
        const result = await unachieveSkillClient(user.id, skillId);
        if (result.success) {
          setAchievements(prev => {
            const newSet = new Set(prev);
            newSet.delete(skillId);
            return newSet;
          });
        }
      } else {
        const result = await achieveSkillClient(user.id, skillId);
        if (result.success) {
          setAchievements(prev => new Set(prev).add(skillId));
        }
      }
    } catch (error) {
      console.error('Error toggling skill:', error);
    }
  };

  if (loading) {
    return <div className="p-4">Loading skill tree...</div>;
  }

  if (!user) {
    return <div className="p-4">Please log in to view your skill tree.</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Your Fitness Profile</CardTitle>
          <CardDescription>Current progress and scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{user.push_score}</div>
              <div className="text-sm text-muted-foreground">Push Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{user.pull_score}</div>
              <div className="text-sm text-muted-foreground">Pull Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{user.legs_score}</div>
              <div className="text-sm text-muted-foreground">Legs Score</div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="text-lg font-semibold">Experience Level: {user.experience_level}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skill Tree</CardTitle>
          <CardDescription>Click skills to mark as achieved</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map((skill) => {
              const isAchieved = achievements.has(skill.id);
              return (
                <Card 
                  key={skill.id} 
                  className={`cursor-pointer transition-colors ${
                    isAchieved ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleSkillToggle(skill.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{skill.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {skill.category} • Difficulty: {skill.difficulty}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {skill.type}
                        </p>
                      </div>
                      <Button
                        variant={isAchieved ? "default" : "outline"}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSkillToggle(skill.id);
                        }}
                      >
                        {isAchieved ? "✓" : "○"}
                      </Button>
                    </div>
                    {skill.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {skill.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}