import { SkillData } from "../types/skillData";

// takes JSON[] and converts to a hash map
// // hash map key: skill.ID, value: Skill.Data, ChildSkill[]
export function buildSkillTree(skills: SkillData[]) {
  const skillsById = new Map<number, SkillData & { children?: any[] }>();
  skills.forEach(skill => skillsById.set(skill.ID, { ...skill }));

  // Build child skill arrays
  // List needs to be ordered top -> bottom
  skills.forEach(skill => {
    if (skill.ParentSkill !== null) {
      const parent = skillsById.get(skill.ParentSkill);
      if (parent) {
        if (!parent.children) parent.children = [];
        parent.children.push(skillsById.get(skill.ID));
      }
    }
  });

  // The root(s) are those with ParentSkill null
  return skills
    .filter(skill => skill.ParentSkill === null)
    .map(skill => skillsById.get(skill.ID));
}