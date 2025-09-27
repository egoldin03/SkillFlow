import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { PushupIcon } from "@/components/chart/PushupIcon";
import { PushProgressIcon } from "@/components/chart/PushProgressIcon";
import { StatsIcon } from "@/components/chart/StatsIcon";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/"}>SkillFlow</Link>
            </div>
            <AuthButton />
          </div>
        </nav>

        <div className="font-sans flex items-center justify-center min-h-screen p-8">
          <main className="flex flex-col items-center gap-8">
            <h1 className="text-4xl font-bold text-center mb-8">SkillFlow</h1>

            <div className="flex gap-8 items-center flex-wrap justify-center">
              <PushupIcon size={220} />
              <PushProgressIcon size={220} progress={75} />
              <StatsIcon size={220} />
            </div>

            <p className="text-lg text-center text-gray-600 max-w-md">
              Track your fitness progress with our pushup training program
            </p>
          </main>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
