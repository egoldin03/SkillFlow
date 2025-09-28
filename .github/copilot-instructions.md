# SkillFlow - AI Agent Instructions

## Project Overview
SkillFlow is a Next.js 15 (App Router) fitness tracking application built with Supabase authentication and shadcn/ui components. The project focuses on pushup training programs with visual progress tracking through custom SVG chart components.

## Architecture & Key Components

### Supabase Integration Pattern
- **Triple Client Setup**: Uses dedicated Supabase clients for different contexts:
  - `lib/supabase/client.ts` - Browser client for client components
  - `lib/supabase/server.ts` - Server client for server components/actions  
  - `lib/supabase/middleware.ts` - Middleware client for auth session management
- **Critical**: Always create new server clients per request (not global) for Fluid compute compatibility
- **Session Management**: Middleware redirects unauthenticated users to `/auth/login` (except for `/auth/*` routes)

### Authentication Flow
- **Protected Routes**: Use `app/protected/` directory with dedicated layout
- **Auth Pages**: Located in `app/auth/` with form components in `/components/`
- **Form Pattern**: Client components handle state with `useState`, call Supabase client directly, redirect with `useRouter`
- **Example**: `components/login-form.tsx` demonstrates the standard auth form pattern

### UI Component System
- **shadcn/ui**: Configured with class-variance-authority (CVA) for variant management
- **Styling**: Tailwind CSS with `cn()` utility from `lib/utils.ts` (combines clsx + tailwind-merge)
- **Theme**: Uses `next-themes` with system/dark/light mode support
- **Custom Components**: Chart components in `components/chart/` use inline SVG with embedded images

### Development Workflow
```bash
npm run dev --turbopack  # Development with Turbopack
npm run build           # Production build
npm run lint           # ESLint checking
```

## Key Patterns & Conventions

### Environment Variables
- Check `lib/utils.ts` `hasEnvVars` for required Supabase environment variables
- Uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` (not the typical `_ANON_KEY` suffix)

### File Organization
- **Server Components**: Default in app directory
- **Client Components**: Explicitly marked with `"use client"` directive
- **Shared Logic**: Utilities in `lib/`, UI components in `components/ui/`
- **Layout Nesting**: Root layout handles theme, protected layout handles navigation

### Custom SVG Components
- `BaseNode.tsx`: SVG-based fitness tracking nodes with embedded images from `/public/`
- Pattern: Accept props for size, difficulty, labels, and click handlers
- Uses `image` tag within SVG to reference public assets

### TypeScript Configuration
- Strict mode enabled with Next.js path aliases (`@/` points to root)
- Uses React 19 with latest Next.js features
- Interface definitions typically inline or in component files

## Common Development Tasks

### Adding Authentication
1. Create form component in `/components/` with client-side state management
2. Import `createClient` from `@/lib/supabase/client`
3. Use `supabase.auth` methods with error handling
4. Redirect using Next.js `useRouter` after success

### Creating UI Components
1. Use shadcn/ui CLI or copy from `/components/ui/` 
2. Apply CVA pattern for variants (see `button.tsx`)
3. Use `cn()` utility for conditional classes
4. Forward refs for proper component composition

### Adding Protected Routes
- Place in `/app/protected/` directory to inherit auth layout
- Server components can use `lib/supabase/server.ts` to access user data
- Client components should handle auth state with Supabase client

## Database Schema & Data Patterns

### Core Tables
- **users**: Extended auth profiles with fitness scores (`push_score`, `pull_score`, `legs_score`) and `experience_level`
- **skills**: Skill tree nodes with `difficulty`, `type` (Regular/Milestone/Variation), `category` (Push/Pull/Legs)
- **user_skills**: Junction table tracking user progress with `achieved_at` timestamps

### Key Data Patterns
- **Skill Tree Structure**: Skills use `coords` (jsonb) for positioning, `previous_skills`/`next_skills` arrays for relationships
- **User Progress**: Query `user_skills` joined with `skills` to show achievement status on skill tree
- **RLS Security**: Users can only access their own progress data, all skills are publicly readable

### Common Queries
```typescript
// Get user profile with scores
const { data: user } = await supabase.from('users').select('*').eq('id', userId).single();

// Get all skills for skill tree display
const { data: skills } = await supabase.from('skills').select('*');

// Get user's achieved skills
const { data: achievements } = await supabase
  .from('user_skills')
  .select('skill_id, achieved_at, skills(*)')
  .eq('user_id', userId);
```

This codebase prioritizes Supabase SSR best practices, modern Next.js patterns, and component reusability through shadcn/ui.