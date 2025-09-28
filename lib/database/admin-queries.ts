import { createClient } from "@/lib/supabase/server";
import type { Skill, SkillType, CategoryType, UserProfile } from "./queries";

/**
 * Admin-only database functions for managing skills
 * These functions should only be called after verifying admin role
 */

export interface CreateSkillData {
  name: string;
  difficulty: number;
  type: SkillType;
  category: CategoryType;
  description?: string;
  previous_skills?: string[];
  next_skills?: string[];
  variations?: string[];
}

export interface UpdateSkillData extends Partial<CreateSkillData> {
  id: string;
}

/**
 * Check if user has admin role
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.error('Error checking admin status:', error);
    return false;
  }

  return data.role === 'Admin';
}

/**
 * Get current user and verify admin status
 */
export async function verifyAdminAccess(): Promise<{ user: UserProfile | null; isAdmin: boolean }> {
  const supabase = await createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { user: null, isAdmin: false };
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return { user: null, isAdmin: false };
  }

  return { 
    user: profile, 
    isAdmin: profile.role === 'Admin' 
  };
}

/**
 * Create a new skill (admin only)
 */
export async function createSkill(skillData: CreateSkillData): Promise<{ success: boolean; data?: Skill; error?: string }> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('skills')
    .insert({
      name: skillData.name,
      difficulty: skillData.difficulty,
      type: skillData.type,
      category: skillData.category,
      description: skillData.description || null,
      previous_skills: skillData.previous_skills || [],
      next_skills: skillData.next_skills || [],
      variations: skillData.variations || []
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating skill:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

/**
 * Update an existing skill (admin only)
 */
export async function updateSkill(skillData: UpdateSkillData): Promise<{ success: boolean; data?: Skill; error?: string }> {
  const supabase = await createClient();
  
  const { id, ...updateData } = skillData;
  
  const { data, error } = await supabase
    .from('skills')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating skill:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

/**
 * Delete a skill (admin only)
 */
export async function deleteSkill(skillId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  
  // First check if skill is referenced by users
  const { data: userSkills } = await supabase
    .from('user_skills')
    .select('skill_id')
    .eq('skill_id', skillId)
    .limit(1);

  if (userSkills && userSkills.length > 0) {
    return { 
      success: false, 
      error: 'Cannot delete skill that has been achieved by users. Consider archiving instead.' 
    };
  }

  const { error } = await supabase
    .from('skills')
    .delete()
    .eq('id', skillId);

  if (error) {
    console.error('Error deleting skill:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get all skills with admin details (including usage statistics)
 */
export async function getSkillsWithStats(): Promise<(Skill & { user_count: number })[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('skills')
    .select(`
      *,
      user_skills(count)
    `)
    .order('difficulty', { ascending: true });

  if (error) {
    console.error('Error fetching skills with stats:', error);
    return [];
  }

  return (data || []).map(skill => ({
    ...skill,
    user_count: skill.user_skills?.[0]?.count || 0
  }));
}

/**
 * Delete all skills (admin only) - DANGEROUS OPERATION
 */
export async function deleteAllSkills(): Promise<{ success: boolean; error?: string; deletedCount?: number }> {
  const supabase = await createClient();
  
  try {
    // First, get count of skills to delete
    const { count: skillCount, error: countError } = await supabase
      .from('skills')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      return { success: false, error: countError.message };
    }

    // Delete all user achievements first (to avoid foreign key constraints)
    const { error: userSkillsError } = await supabase
      .from('user_skills')
      .delete()
      .neq('user_id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (userSkillsError) {
      console.error('Error deleting user achievements:', userSkillsError);
      return { success: false, error: `Failed to delete user achievements: ${userSkillsError.message}` };
    }

    // Then delete all skills
    const { error: skillsError } = await supabase
      .from('skills')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (skillsError) {
      console.error('Error deleting skills:', skillsError);
      return { success: false, error: `Failed to delete skills: ${skillsError.message}` };
    }

    return { success: true, deletedCount: skillCount || 0 };
  } catch (error) {
    console.error('Error in deleteAllSkills:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Get skill relationships for admin management
 */
export async function getSkillRelationships(skillId: string): Promise<{
  parents: Skill[];
  children: Skill[];
  variations: Skill[];
}> {
  const supabase = await createClient();
  
  // Get the skill itself
  const { data: skill } = await supabase
    .from('skills')
    .select('*')
    .eq('id', skillId)
    .single();

  if (!skill) {
    return { parents: [], children: [], variations: [] };
  }

  // Get related skills
  const relatedIds = [
    ...(skill.previous_skills || []),
    ...(skill.next_skills || []),
    ...(skill.variations || [])
  ];

  if (relatedIds.length === 0) {
    return { parents: [], children: [], variations: [] };
  }

  const { data: relatedSkills } = await supabase
    .from('skills')
    .select('*')
    .in('id', relatedIds);

  const skillsMap = new Map((relatedSkills || []).map(s => [s.id, s]));

  return {
    parents: (skill.previous_skills || []).map((id: string) => skillsMap.get(id)).filter(Boolean) as Skill[],
    children: (skill.next_skills || []).map((id: string) => skillsMap.get(id)).filter(Boolean) as Skill[],
    variations: (skill.variations || []).map((id: string) => skillsMap.get(id)).filter(Boolean) as Skill[]
  };
}

/**
 * Update skill relationships bidirectionally
 * When skill A -> B relationship is added:
 * - A.next_skills includes B
 * - B.previous_skills includes A
 */
export async function updateSkillRelationships(
  skillId: string, 
  newPreviousSkills: string[], 
  newNextSkills: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    
    // Get current skill to see what relationships need to be updated
    const { data: currentSkill, error: fetchError } = await supabase
      .from('skills')
      .select('previous_skills, next_skills')
      .eq('id', skillId)
      .single();

    if (fetchError) {
      console.error('Error fetching current skill:', fetchError);
      return { success: false, error: `Failed to fetch current skill: ${fetchError.message}` };
    }

    const currentPrevious = currentSkill.previous_skills || [];
    const currentNext = currentSkill.next_skills || [];

    // Update the main skill
    const { error: updateError } = await supabase
      .from('skills')
      .update({
        previous_skills: newPreviousSkills,
        next_skills: newNextSkills
      })
      .eq('id', skillId);

    if (updateError) {
      console.error('Error updating skill relationships:', updateError);
      return { success: false, error: `Failed to update skill: ${updateError.message}` };
    }

    // Handle bidirectional updates for previous skills
    // Remove this skill from old previous skills' next_skills
    for (const prevSkillId of currentPrevious) {
      if (!newPreviousSkills.includes(prevSkillId)) {
        const { data: prevSkill } = await supabase
          .from('skills')
          .select('next_skills')
          .eq('id', prevSkillId)
          .single();

        if (prevSkill) {
          const updatedNextSkills = (prevSkill.next_skills || []).filter((id: string) => id !== skillId);
          await supabase
            .from('skills')
            .update({ next_skills: updatedNextSkills })
            .eq('id', prevSkillId);
        }
      }
    }

    // Add this skill to new previous skills' next_skills
    for (const prevSkillId of newPreviousSkills) {
      if (!currentPrevious.includes(prevSkillId)) {
        const { data: prevSkill } = await supabase
          .from('skills')
          .select('next_skills')
          .eq('id', prevSkillId)
          .single();

        if (prevSkill) {
          const updatedNextSkills = [...(prevSkill.next_skills || []), skillId];
          await supabase
            .from('skills')
            .update({ next_skills: updatedNextSkills })
            .eq('id', prevSkillId);
        }
      }
    }

    // Handle bidirectional updates for next skills
    // Remove this skill from old next skills' previous_skills
    for (const nextSkillId of currentNext) {
      if (!newNextSkills.includes(nextSkillId)) {
        const { data: nextSkill } = await supabase
          .from('skills')
          .select('previous_skills')
          .eq('id', nextSkillId)
          .single();

        if (nextSkill) {
          const updatedPreviousSkills = (nextSkill.previous_skills || []).filter((id: string) => id !== skillId);
          await supabase
            .from('skills')
            .update({ previous_skills: updatedPreviousSkills })
            .eq('id', nextSkillId);
        }
      }
    }

    // Add this skill to new next skills' previous_skills
    for (const nextSkillId of newNextSkills) {
      if (!currentNext.includes(nextSkillId)) {
        const { data: nextSkill } = await supabase
          .from('skills')
          .select('previous_skills')
          .eq('id', nextSkillId)
          .single();

        if (nextSkill) {
          const updatedPreviousSkills = [...(nextSkill.previous_skills || []), skillId];
          await supabase
            .from('skills')
            .update({ previous_skills: updatedPreviousSkills })
            .eq('id', nextSkillId);
        }
      }
    }

    return { success: true };

  } catch (error) {
    console.error('Unexpected error in updateSkillRelationships:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}