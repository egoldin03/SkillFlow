import SkillTree from "../../../components/benTreeComponents/skillTree";
import treeData from '../../../data/treeData.json'; 
import {SkillData} from '../../../types/skillData'



export default function Home() {
  return (
    <div>
      <h1>Calisthenics Skill Tree</h1>
      <SkillTree skills={treeData as SkillData[]} />
      <p>Zoom and pan with your mouse or trackpad. Hover for descriptions.</p>
    </div>
  );
}
