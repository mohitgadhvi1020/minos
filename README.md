# MindOS — Your Personal Thought Operating System

A minimalistic personal productivity app that captures your thoughts via voice or text, uses AI to extract tasks and suggest priorities, tracks habits, sets daily goals, and builds a profile of who you are.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Setup

### 1. Supabase Database

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Copy your **Project URL** and **Anon Key** from Settings > API

### 2. API Keys

1. Get an OpenAI API key from [platform.openai.com](https://platform.openai.com) (required for voice transcription via Whisper)
2. Optionally get an Anthropic API key from [console.anthropic.com](https://console.anthropic.com)

### 3. Configure in App

Go to **Settings** in the app and enter:
- Supabase Project URL and Anon Key
- OpenAI API key
- Anthropic API key (optional)
- Choose your preferred AI provider

All keys are stored locally in your browser's localStorage — never sent to any server except the respective API providers.

## Features

- **Brain Dump**: Capture thoughts via voice (OpenAI Whisper) or text
- **AI Processing**: Extracts tasks, suggests priorities, identifies follow-ups and linked tasks
- **Task Management**: Priority-based task list with status tracking and task linking
- **Habit Tracker**: Daily/weekly habit tracking with streak counting
- **Daily Goals**: Set and track daily goals
- **Core Self**: Define your values, personality, goals, and principles
- **Dark/Light Mode**: Minimalistic design with theme switching

## Tech Stack

- Next.js 16 (App Router)
- Tailwind CSS v4
- Supabase (PostgreSQL)
- OpenAI Whisper API
- OpenAI GPT-4o / Anthropic Claude
- SWR for data fetching
- TypeScript
