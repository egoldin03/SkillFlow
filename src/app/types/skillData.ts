export interface SkillData {
  ID: number;
  Name: string;
  Difficulty: number;
  Type: string;
  Category: string;
  Description: string;
  ParentSkill: number | null;
  NextSkills: number[];
  Variations: number[];
}