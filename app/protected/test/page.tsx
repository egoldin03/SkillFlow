import { SkillTreeExample } from "@/components/skill-tree-example-test";
import { ServerSkillTree } from "@/components/server-skill-test";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Database Test Page</h1>
        <p className="text-muted-foreground mt-2">
          Testing the database functions and skill tree components
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Server-Side Skill Tree</CardTitle>
          <CardDescription>
            This component loads data on the server and renders with your current progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ServerSkillTree />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Client-Side Interactive Skill Tree</CardTitle>
          <CardDescription>
            This component loads data on the client and allows you to toggle skill achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SkillTreeExample />
        </CardContent>
      </Card>
    </div>
  );
}