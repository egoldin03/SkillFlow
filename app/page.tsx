import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { StatsIcon } from "@/components/chart/StatsIcon";
import { BaseNode } from "@/components/chart/BaseNode";
import { BaseProgressIcon } from "@/components/chart/BaseProgressIcon";
import { SettingsIcon } from "@/components/chart/SettingsIcon";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center bg-background">
      {/* Fixed vertical progress icons in top left */}
      <div className="fixed top-12 left-4 z-50 flex flex-col">
        <BaseProgressIcon size={110} progress={80} label="Push" image_path="/pushup.svg" />
        <BaseProgressIcon size={110} progress={80} label="Pull" image_path="/pushup.svg" />
        <BaseProgressIcon size={110} progress={80} label="Legs" image_path="/pushup.svg" />
      </div>

      {/* Fixed StatsIcon in top right */}
      <div className="fixed top-12 right-4 z-50 flex flex-col gap-0 items-center">
        <SettingsIcon size={75} />
        <StatsIcon size={120} />
      </div>

      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/"}>SkillFlow</Link>
            </div>
            <AuthButton />
          </div>
        </nav>

        <div className="font-sans flex items-center justify-center h-full p-8">
          <main className="flex flex-col items-center gap-8">

            <div className="flex gap-8 items-center flex-wrap justify-center">
              <BaseNode size={220} label="Pushup" image_path="/pushup.svg" />
            </div>

            
          </main>
        </div>
      </div>
    </main>
  );
}
