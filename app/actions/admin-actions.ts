"use server";

import { createSkill, updateSkill, deleteSkill, deleteAllSkills, updateSkillRelationships } from "@/lib/database/admin-queries";
import type { CreateSkillData, UpdateSkillData } from "@/lib/database/admin-queries";

/**
 * Server Actions for admin operations
 * These can be called from client components safely
 */

export async function createSkillAction(skillData: CreateSkillData) {
  try {
    const result = await createSkill(skillData);
    return result;
  } catch (error) {
    console.error('Server action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function updateSkillAction(skillData: UpdateSkillData) {
  try {
    const result = await updateSkill(skillData);
    return result;
  } catch (error) {
    console.error('Server action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function deleteSkillAction(skillId: string) {
  try {
    const result = await deleteSkill(skillId);
    return result;
  } catch (error) {
    console.error('Server action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function deleteAllSkillsAction() {
  try {
    const result = await deleteAllSkills();
    return result;
  } catch (error) {
    console.error('Server action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function updateSkillRelationshipsAction(
  skillId: string, 
  newPreviousSkills: string[], 
  newNextSkills: string[]
) {
  try {
    const result = await updateSkillRelationships(skillId, newPreviousSkills, newNextSkills);
    return result;
  } catch (error) {
    console.error('Server action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}