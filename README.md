# Orbit Pro 🚀

A gamified habit tracker built with Expo, React Native, and Supabase.

## Features

- ✅ **Habit tracking** with streaks, XP, and level system
- 🎮 **Gamification** — badges, daily missions, celebrations
- 🤖 **AI Coach** — powered by Cloudflare Workers AI (Llama 3)
- 👥 **Social** — friends, stories, challenges, encouragements
- 📅 **Planner** — daily/weekly activity planner
- 📊 **Stats** — heatmap calendar, mood correlation, weekly reports
- 🎯 **Focus Mode** — Pomodoro timer linked to habits
- 😊 **Mood Check-in** — daily mood tracking with correlation
- 🧊 **Streak Freeze** — protect your streak (1 free/week + recharge via ad)
- 🏆 **Secret Badges** — hidden achievements to discover
- 🎬 **Rewarded Ads** — earn bonus XP via AdMob
- 🔄 **OTA Updates** — seamless updates via Expo Updates
- 🌙 **Quiet Hours** — no notifications during sleep
- 🌍 **i18n** — French & English
- 📱 **Android Widget** — home screen habit tracker
- 🎨 **Personalization** — themes, avatars, accent colors

## Setup

### 1. Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Supabase project

### 2. Install

```bash
npm install
```

### 3. Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

### 4. Supabase

Run `supabase-schema.sql` in your Supabase SQL Editor.

### 5. Run

```bash
npx expo start
```

## Cloudflare Workers AI Setup

1. Create a [Cloudflare](https://dash.cloudflare.com) account
2. Go to **AI** → **Workers AI**
3. Get your **Account ID** from the dashboard URL
4. Create an **API Token** with Workers AI permissions
5. Set `EXPO_PUBLIC_CLOUDFLARE_ACCOUNT_ID` and `EXPO_PUBLIC_CLOUDFLARE_AI_TOKEN` in `.env`
6. The AI Coach uses `@cf/meta/llama-3-8b-instruct` with a 20 msg/day limit per user
7. Falls back to local heuristic responses if API is unavailable

## Google AdMob Setup

1. Create an [AdMob](https://admob.google.com) account
2. Create app entries for iOS and Android
3. Create ad units: Rewarded, Interstitial, Banner
4. Update `EXPO_PUBLIC_ADMOB_*` in `.env` with your ad unit IDs
5. Update `app.json` iOS `GADApplicationIdentifier` and the `react-native-google-mobile-ads` plugin app IDs
6. Test ad IDs are pre-configured for development

### Ad Limits
- **Rewarded**: max 5/day — +50 XP bonus (1x/day), double XP, streak freeze recharge, detailed stats
- **Interstitial**: every 10th habit completion, max 3/day
- **Banner**: marketplace and support pages only

## Expo OTA Updates Setup

1. Configure `eas.json` for your project
2. The app checks for updates on launch via `expo-updates`
3. A subtle toast appears when an update is available
4. Set the `updates.url` in `app.json` to your Expo project URL

## OTA Updates — Pushing Updates

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Push an update to production
eas update --branch production --message "Bug fixes and improvements"

# Push to preview
eas update --branch preview --message "Testing new feature"
```

Updates are downloaded silently in the background. Users see a subtle toast and choose when to restart.

## CI/CD with GitHub Actions

Create `.github/workflows/update.yml`:

```yaml
name: OTA Update
on:
  push:
    branches: [main]
jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 18 }
      - run: npm ci
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: eas update --branch production --auto
```

Set `EXPO_TOKEN` in your GitHub repo secrets (get it from expo.dev account settings).

## Architecture

```
orbit-pro/
├── app/              # Expo Router pages
│   ├── tabs/         # Tab screens (home, habits, social, stats, planner, profile)
│   ├── ai-coach/     # AI Coach (Cloudflare Workers AI)
│   ├── focus.tsx      # Focus/Pomodoro timer
│   ├── weekly-report.tsx # Weekly report
│   ├── auth/         # Login/Signup
│   ├── habits/       # Create/edit habits
│   ├── social/       # Friends, chat, stories, challenges
│   ├── marketplace/  # Pre-made routines
│   └── support/      # FAQ & chatbot
├── components/       # Reusable components
├── constants/        # Theme, badges, levels
├── contexts/         # App & Social contexts
├── i18n/             # Translations (FR/EN)
├── lib/              # Supabase client
├── services/         # Ads, AI Coach, notifications, updates, etc.
└── widgets/          # Android widget
```

## Contact

miguelfreddy65@gmail.com
