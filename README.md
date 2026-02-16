This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

**clonestar** — AI Avatar Video Studio: paste a YouTube link or transcript, pick avatar and voice, and generate AI avatar videos (OpenAI script, ElevenLabs voice, HeyGen video).

## Setup

1. **Supabase** — Create a project at [supabase.com](https://supabase.com). Run the migration:
   - In Dashboard: SQL Editor → run contents of `supabase/migrations/001_initial.sql`.
   - Create Storage buckets: `avatars` (public) and `generated-videos` (public), with RLS so users can read/write only their own folder `{user_id}/*`.

2. **Environment** — Copy `.env.local.example` to `.env.local` and set:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`
   - `OPENAI_API_KEY` (or add per-user in Settings)
   - Users add ElevenLabs and HeyGen API keys in **Settings** in the app.

3. **HeyGen webhook** — Deploy the Edge Function and register the URL in HeyGen:
   - `supabase functions deploy heygen-webhook --no-verify-jwt`
   - URL: `https://<project-ref>.supabase.co/functions/v1/heygen-webhook`
   - In HeyGen Dashboard → Webhooks → Add endpoint → subscribe to `avatar_video.success` and `avatar_video.fail`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
