# FormForge

FormForge is a Next.js app for building forms, collecting submissions, and managing projects in a clean, modern dashboard.

Live URL: https://form-forge-self.vercel.app/

## Features

- Projects and forms management
- Public form pages with shareable links
- Submissions tracking and response insights
- Drag-and-drop field ordering
- Dashboard analytics (totals and recent activity)
- Supabase authentication

## Tech Stack

- Next.js (App Router)
- React
- Tailwind CSS
- Prisma + PostgreSQL
- Supabase Auth

## Routes

- `/` - Marketing landing page
- `/auth/login` - Log in
- `/auth/signup` - Sign up
- `/dashboard` - Overview dashboard
- `/projects` - Projects list
- `/projects/[projectId]` - Project detail
- `/projects/[projectId]/forms/[formId]` - Form builder + responses
- `/forms/[slug]` - Public form

## Getting Started

1) Install dependencies:

```bash
npm install
```

2) Create a `.env` file with:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=
```

3) Generate Prisma client:

```bash
npx prisma generate
```

4) Run the dev server:

```bash
npm run dev
```

## Scripts

- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Lint


