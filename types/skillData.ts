export interface SkillData {
  ID: String;
  Name: string;
  Difficulty: number;
  Type: string;
  Category: string;
  Description: string;
  ParentSkill: String | null;
  NextSkills: String[];
  Variations: String[];
}