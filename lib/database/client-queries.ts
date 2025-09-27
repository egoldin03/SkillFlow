import { createClient } from "@/lib/supabase/client";
import type { SkillType, CategoryType, Skill, UserProfile, UserSkillAchievement } from "./queries";

/**
 * Client-side database functions for use in client components
 * These functions use the browser Supabase client
 */

/**
 * Mark a skill as achieved for a user (client-side)
 */
export async function achieveSkillClient(userId: string, skillId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('user_skills')
    .insert({
      user_id: userId,
      skill_id: skillId,
      achieved_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error achieving skill:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Remove a skill achievement (client-side)
 */
export async function unachieveSkillClient(userId: string, skillId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('user_skills')
    .delete()
    .eq('user_id', userId)
    .eq('skill_id', skillId);

  if (error) {
    console.error('Error unachieving skill:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Update user fitness scores (client-side)
 */
export async function updateUserScoresClient(
  userId: string, 
  scores: { push_score?: number; pull_score?: number; legs_score?: number; experience_level?: number }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('users')
    .update(scores)
    .eq('id', userId);

  if (error) {
    console.error('Error updating user scores:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get current user profile (client-side)
 */
export async function getCurrentUserProfile(): Promise<{ data: UserProfile | null; error?: string }> {
  const supabase = createClient();
  
  // First get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { data: null, error: userError?.message || 'Not authenticated' };
  }

  // Then get their profile
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return { data: null, error: error.message };
  }

  return { data };
}

/**
 * Get all skills (client-side) 
 */
export async function getAllSkillsClient(): Promise<{ data: Skill[]; error?: string }> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .order('difficulty', { ascending: true });

  if (error) {
    console.error('Error fetching skills:', error);
    return { data: [], error: error.message };
  }

  return { data: data || [] };
}