import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserProfile, getSkillTreeWithProgress } from "@/lib/database/queries";
import { createClient } from "@/lib/supabase/server";

interface ServerSkillTreeProps {
  userId?: string;
}

export async function ServerSkillTree({ userId }: ServerSkillTreeProps) {
  // Get current user if no userId provided
  let currentUserId = userId;
  
  if (!currentUserId) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    currentUserId = user?.id;
  }

  if (!currentUserId) {
    return (
      <div className="p-4">
        <p>Please log in to view your skill tree.</p>
      </div>
    );
  }

  // Load user data and skill tree with achievements
  const [userProfile, skillTreeData] = await Promise.all([
    getUserProfile(currentUserId),
    getSkillTreeWithProgress(currentUserId)
  ]);

  if (!userProfile) {
    return (
      <div className="p-4">
        <p>User profile not found.</p>
      </div>
    );
  }

  const { skills, achievements } = skillTreeData;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Fitness Progress</CardTitle>
          <CardDescription>Your current fitness scores and level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">{userProfile.push_score}</div>
              <div className="text-sm text-muted-foreground">Push</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">{userProfile.pull_score}</div>
              <div className="text-sm text-muted-foreground">Pull</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">{userProfile.legs_score}</div>
              <div className="text-sm text-muted-foreground">Legs</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">{userProfile.experience_level}</div>
              <div className="text-sm text-muted-foreground">Level</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skill Overview</CardTitle>
          <CardDescription>
            {achievements.size} of {skills.length} skills achieved
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['Push', 'Pull', 'Legs'].map((category) => {
              const categorySkills = skills.filter(skill => skill.category === category);
              const achievedInCategory = categorySkills.filter(skill => achievements.has(skill.id)).length;
              
              return (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{category} Skills</h3>
                    <span className="text-sm text-muted-foreground">
                      {achievedInCategory} / {categorySkills.length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${categorySkills.length > 0 ? (achievedInCategory / categorySkills.length) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {categorySkills.slice(0, 6).map((skill) => (
                      <div 
                        key={skill.id}
                        className={`p-2 rounded border text-sm ${
                          achievements.has(skill.id) 
                            ? 'bg-green-50 border-green-200 text-green-800' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="font-medium">{skill.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {skill.type} • Level {skill.difficulty}
                        </div>
                      </div>
                    ))}
                    {categorySkills.length > 6 && (
                      <div className="p-2 rounded border bg-gray-50 border-gray-200 text-sm text-center text-muted-foreground">
                        +{categorySkills.length - 6} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}