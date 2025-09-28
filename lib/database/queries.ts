import { createClient } from "@/lib/supabase/server";

export type SkillType = 'Regular' | 'Milestone' | 'Variation';
export type CategoryType = 'Push' | 'Pull' | 'Legs';
export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
export type UserRole = 'Admin' | 'Member';

export interface Skill {
  id: string;
  name: string;
  difficulty: number;
  type: SkillType;
  category: CategoryType;
  description?: string;
  previous_skills: string[];
  next_skills: string[];
  variations: string[];
}

export interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  push_score: number;
  pull_score: number;
  legs_score: number;
  experience_level: ExperienceLevel;
  role: UserRole;
}

export interface UserSkillAchievement {
  user_id: string;
  skill_id: string;
  achieved_at: string;
  skills: Skill[];
}

/**
 * Get user profile with fitness scores
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

/**
 * Get all skills for skill tree visualization
 */
export async function getAllSkills(): Promise<Skill[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .order('difficulty', { ascending: true });

  if (error) {
    console.error('Error fetching skills:', error);
    return [];
  }

  return data || [];
}

/**
 * Get user's achieved skills with full skill details
 */
export async function getUserAchievements(userId: string): Promise<UserSkillAchievement[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('user_skills')
    .select(`
      user_id,
      skill_id,
      achieved_at,
      skills (
        id,
        name,
        difficulty,
        type,
        category,
        description,
        previous_skills,
        next_skills,
        variations
      )
    `)
    .eq('user_id', userId)
    .order('achieved_at', { ascending: false });

  if (error) {
    console.error('Error fetching user achievements:', error);
    return [];
  }

  return data || [];
}

/**
 * Get skills by category for filtered visualization
 */
export async function getSkillsByCategory(category: CategoryType): Promise<Skill[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('category', category)
    .order('difficulty', { ascending: true });

  if (error) {
    console.error('Error fetching skills by category:', error);
    return [];
  }

  return data || [];
}

/**
 * Mark a skill as achieved for a user
 */
export async function achieveSkill(userId: string, skillId: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('user_skills')
    .insert({
      user_id: userId,
      skill_id: skillId,
      achieved_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error achieving skill:', error);
    return false;
  }

  return true;
}

/**
 * Remove a skill achievement (if user wants to unmark)
 */
export async function unachieveSkill(userId: string, skillId: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('user_skills')
    .delete()
    .eq('user_id', userId)
    .eq('skill_id', skillId);

  if (error) {
    console.error('Error unachieving skill:', error);
    return false;
  }

  return true;
}

/**
 * Update user fitness scores
 */
export async function updateUserScores(
  userId: string, 
  scores: { push_score?: number; pull_score?: number; legs_score?: number; experience_level?: number }
): Promise<boolean> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('users')
    .update(scores)
    .eq('id', userId);

  if (error) {
    console.error('Error updating user scores:', error);
    return false;
  }

  return true;
}

/**
 * Get skill tree data with user progress overlay
 */
export async function getSkillTreeWithProgress(userId: string): Promise<{
  skills: Skill[];
  achievements: Set<string>;
}> {
  const [skills, achievements] = await Promise.all([
    getAllSkills(),
    getUserAchievements(userId)
  ]);

  const achievedSkillIds = new Set(achievements.map(a => a.skill_id));

  return {
    skills,
    achievements: achievedSkillIds
  };
}