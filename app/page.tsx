
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SkillFlow
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Track your fitness journey with our comprehensive skill tree system. 
            Master push-ups, pull-ups, and leg exercises step by step.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                💪 Push Skills
              </CardTitle>
              <CardDescription>
                Master push-up variations from beginner to advanced
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Progress through standard push-ups, diamond push-ups, one-arm push-ups and more.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🏋️ Pull Skills
              </CardTitle>
              <CardDescription>
                Build your pulling strength with structured progressions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                From assisted pull-ups to muscle-ups, track your upper body strength journey.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🦵 Leg Skills
              </CardTitle>
              <CardDescription>
                Develop lower body strength and mobility
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Squats, lunges, pistol squats, and advanced leg exercises await.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 mt-12">
          <Button asChild size="lg" className="text-lg px-8 py-3">
            <Link href="/auth/login">
              Get Started
            </Link>
          </Button>
          
          <div className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
