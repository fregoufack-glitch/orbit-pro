import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLanguage } from '../i18n';

// ============================================
// Cloudflare Workers AI Coach — FREE (10k req/day)
// Fallback: local heuristic responses if API fails
// ============================================

const CLOUDFLARE_ACCOUNT_ID = process.env.EXPO_PUBLIC_CLOUDFLARE_ACCOUNT_ID || '';
const CLOUDFLARE_AI_TOKEN = process.env.EXPO_PUBLIC_CLOUDFLARE_AI_TOKEN || '';
const MODEL = '@cf/meta/llama-3-8b-instruct';
const API_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/${MODEL}`;

const MAX_MESSAGES_PER_DAY = 20;
const CACHE_KEY = '@orbit_coach_state';

interface CoachState {
  date: string;
  messageCount: number;
  cache: Record<string, { response: string; timestamp: number }>;
}

export interface CoachContext {
  pseudo: string;
  level: number;
  xp: number;
  streak: number;
  habitsCount: number;
  todayCompleted: number;
  todayTotal: number;
  badges: string[];
  language: string;
  mood?: string;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

async function loadState(): Promise<CoachState> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (raw) {
      const state: CoachState = JSON.parse(raw);
      if (state.date === todayStr()) return state;
    }
  } catch {}
  return { date: todayStr(), messageCount: 0, cache: {} };
}

async function saveState(state: CoachState): Promise<void> {
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(state));
}

export async function getRemainingMessages(): Promise<number> {
  const state = await loadState();
  return Math.max(0, MAX_MESSAGES_PER_DAY - state.messageCount);
}

function buildSystemPrompt(ctx: CoachContext): string {
  const lang = ctx.language === 'fr' ? 'français' : 'English';
  return `Tu es Orbit Coach, le coach IA personnel de l'app Orbit Pro. Tu es motivant, fun, et tu donnes des conseils pratiques sur les habitudes et la productivité. Tu parles en ${lang}. Voici le profil de l'utilisateur :
- Pseudo: ${ctx.pseudo}
- Niveau: ${ctx.level} (${ctx.xp} XP)
- Streak: ${ctx.streak} jours
- Habitudes: ${ctx.habitsCount} (${ctx.todayCompleted}/${ctx.todayTotal} complétées aujourd'hui)
- Badges: ${ctx.badges.length > 0 ? ctx.badges.join(' ') : 'aucun encore'}
${ctx.mood ? `- Humeur: ${ctx.mood}` : ''}
Sois concis (max 3 phrases), encourageant, et utilise des emojis. Style Duolingo: fun, positif, jamais culpabilisant.`;
}

function getCacheKey(message: string): string {
  return message.toLowerCase().trim().replace(/\s+/g, ' ').slice(0, 100);
}

async function callCloudflareAI(message: string, ctx: CoachContext): Promise<string> {
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_AI_TOKEN) {
    throw new Error('Cloudflare credentials not configured');
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_AI_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: buildSystemPrompt(ctx) },
        { role: 'user', content: message },
      ],
      max_tokens: 256,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Cloudflare AI returned ${response.status}`);
  }

  const data = await response.json();
  const result = data?.result?.response;
  if (!result || typeof result !== 'string') {
    throw new Error('Invalid response from Cloudflare AI');
  }

  return result.trim();
}

// ============================================
// Local fallback responses (when API unavailable)
// ============================================

function getLocalResponse(message: string, ctx: CoachContext): string {
  const lang = ctx.language;
  const msg = message.toLowerCase();
  const progress = ctx.todayTotal > 0 ? ctx.todayCompleted / ctx.todayTotal : 0;

  // Motivation
  if (msg.includes('motiv') || msg.includes('💪')) {
    if (ctx.streak > 7) {
      return lang === 'fr'
        ? `🔥 ${ctx.streak} jours de streak, c'est incroyable ${ctx.pseudo} ! Tu es une machine à habitudes. Continue comme ça ! 💪`
        : `🔥 ${ctx.streak}-day streak, that's incredible ${ctx.pseudo}! You're a habit machine. Keep going! 💪`;
    }
    if (progress >= 1) {
      return lang === 'fr'
        ? `🎉 Toutes tes habitudes sont complétées aujourd'hui ! Tu es un champion ${ctx.pseudo} ! 🏆`
        : `🎉 All habits completed today! You're a champion ${ctx.pseudo}! 🏆`;
    }
    return lang === 'fr'
      ? `💪 Allez ${ctx.pseudo} ! Tu as déjà ${ctx.todayCompleted}/${ctx.todayTotal} habitudes faites. Chaque petite victoire compte ! 🚀`
      : `💪 Come on ${ctx.pseudo}! You've already done ${ctx.todayCompleted}/${ctx.todayTotal} habits. Every small win counts! 🚀`;
  }

  // Tips / Advice
  if (msg.includes('conseil') || msg.includes('tip') || msg.includes('💡')) {
    const tips_fr = [
      '📌 Commence par la plus petite habitude le matin. L\'élan positif fera le reste ! 🌅',
      '⏰ Associe tes habitudes à des activités existantes (après le café → méditation). C\'est le "habit stacking" ! ☕',
      '🎯 Concentre-toi sur la constance, pas la perfection. Même 1 minute compte ! 💫',
      '📱 Mets Orbit Pro sur ton écran d\'accueil. Ce qui est visible se fait plus facilement ! 👀',
      '🧊 Si tu rates un jour, pas de panique ! Utilise ton streak freeze et reprends demain 💪',
    ];
    const tips_en = [
      '📌 Start with the smallest habit in the morning. Positive momentum will do the rest! 🌅',
      '⏰ Stack habits onto existing activities (after coffee → meditate). That\'s "habit stacking"! ☕',
      '🎯 Focus on consistency, not perfection. Even 1 minute counts! 💫',
      '📱 Put Orbit Pro on your home screen. What\'s visible gets done! 👀',
      '🧊 If you miss a day, don\'t panic! Use your streak freeze and come back tomorrow 💪',
    ];
    const tips = lang === 'fr' ? tips_fr : tips_en;
    return tips[Math.floor(Math.random() * tips.length)];
  }

  // Review / Progress
  if (msg.includes('bilan') || msg.includes('review') || msg.includes('progress') || msg.includes('📊')) {
    if (progress >= 1) {
      return lang === 'fr'
        ? `📊 Journée parfaite ! ${ctx.todayCompleted}/${ctx.todayTotal} habitudes ✅. Niveau ${ctx.level}, streak de ${ctx.streak} jours. Tu assures ! 🌟`
        : `📊 Perfect day! ${ctx.todayCompleted}/${ctx.todayTotal} habits ✅. Level ${ctx.level}, ${ctx.streak}-day streak. You rock! 🌟`;
    }
    return lang === 'fr'
      ? `📊 Aujourd'hui : ${ctx.todayCompleted}/${ctx.todayTotal} habitudes. Niveau ${ctx.level} (${ctx.xp} XP), streak ${ctx.streak} jours. ${progress > 0.5 ? 'Bonne progression !' : 'Tu peux encore y arriver !'} 💪`
      : `📊 Today: ${ctx.todayCompleted}/${ctx.todayTotal} habits. Level ${ctx.level} (${ctx.xp} XP), ${ctx.streak}-day streak. ${progress > 0.5 ? 'Good progress!' : 'You can still do it!'} 💪`;
  }

  // Challenge
  if (msg.includes('défi') || msg.includes('challenge') || msg.includes('🎯')) {
    const challenges_fr = [
      '🎯 Défi : complète toutes tes habitudes avant midi demain ! Le matin est le moment le plus puissant 🌅',
      '🎯 Défi 7 jours : ajoute 5 minutes de lecture chaque jour. Les petits changements créent de grands résultats ! 📚',
      '🎯 Défi social : partage ta streak dans les stories et motive un ami à rejoindre Orbit ! 👥',
    ];
    const challenges_en = [
      '🎯 Challenge: complete all habits before noon tomorrow! Morning is the most powerful time 🌅',
      '🎯 7-day challenge: add 5 minutes of reading daily. Small changes create big results! 📚',
      '🎯 Social challenge: share your streak in stories and motivate a friend to join Orbit! 👥',
    ];
    const ch = lang === 'fr' ? challenges_fr : challenges_en;
    return ch[Math.floor(Math.random() * ch.length)];
  }

  // Routine / Plan
  if (msg.includes('routine') || msg.includes('plan') || msg.includes('📅') || msg.includes('journée')) {
    return lang === 'fr'
      ? `📅 Je te suggère : matin → habitudes physiques 🏃, après-midi → habitudes créatives 🎨, soir → habitudes de réflexion 🧘. Adapte selon ton énergie ! ⚡`
      : `📅 I suggest: morning → physical habits 🏃, afternoon → creative habits 🎨, evening → reflective habits 🧘. Adapt to your energy! ⚡`;
  }

  // Mindset
  if (msg.includes('mindset') || msg.includes('🧠') || msg.includes('mental')) {
    return lang === 'fr'
      ? `🧠 Rappelle-toi : tu ne construis pas juste des habitudes, tu construis la personne que tu veux devenir. Chaque jour est un vote pour ton futur toi ! 🗳️✨`
      : `🧠 Remember: you're not just building habits, you're building the person you want to become. Every day is a vote for your future self! 🗳️✨`;
  }

  // Streak tips
  if (msg.includes('streak')) {
    return lang === 'fr'
      ? `🔥 Pour maintenir ton streak : fais ta plus facile habitude en premier, utilise les rappels, et garde un streak freeze en réserve ! Tu as ${ctx.streak} jours, ne lâche rien ! 💪`
      : `🔥 To keep your streak: do your easiest habit first, use reminders, and keep a streak freeze ready! You have ${ctx.streak} days, don't give up! 💪`;
  }

  // Badges
  if (msg.includes('badge') || msg.includes('🏆')) {
    return lang === 'fr'
      ? `🏆 Tu as ${ctx.badges.length} badges ! Il y a aussi des badges secrets cachés dans l'app... Explore et tu les trouveras ! Prochaine étape : atteindre le niveau ${ctx.level + 1} ! 🎖️`
      : `🏆 You have ${ctx.badges.length} badges! There are also secret badges hidden in the app... Explore and you'll find them! Next goal: reach level ${ctx.level + 1}! 🎖️`;
  }

  // Default
  return lang === 'fr'
    ? `😊 Je suis là pour t'aider ${ctx.pseudo} ! Demande-moi de la motivation, des conseils, un défi, ou un bilan de ta journée. On avance ensemble ! 🚀`
    : `😊 I'm here to help ${ctx.pseudo}! Ask me for motivation, tips, a challenge, or a review of your day. We move forward together! 🚀`;
}

// ============================================
// Main API
// ============================================

export async function askCoach(message: string, ctx: CoachContext): Promise<string> {
  const state = await loadState();

  // Check daily limit
  if (state.messageCount >= MAX_MESSAGES_PER_DAY) {
    return ctx.language === 'fr'
      ? `⏳ Tu as atteint la limite de ${MAX_MESSAGES_PER_DAY} messages aujourd'hui. Reviens demain pour plus de coaching ! 💪`
      : `⏳ You've reached the ${MAX_MESSAGES_PER_DAY} message limit for today. Come back tomorrow for more coaching! 💪`;
  }

  // Check cache (5 min TTL)
  const cacheKey = getCacheKey(message);
  const cached = state.cache[cacheKey];
  if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
    state.messageCount += 1;
    await saveState(state);
    return cached.response;
  }

  // Try Cloudflare AI
  let response: string;
  try {
    response = await callCloudflareAI(message, ctx);
  } catch (err) {
    console.log('[aiCoach] Cloudflare AI failed, using fallback:', (err as Error).message);
    response = getLocalResponse(message, ctx);
  }

  // Update state + cache
  state.messageCount += 1;
  state.cache[cacheKey] = { response, timestamp: Date.now() };
  // Keep cache small (max 20 entries)
  const keys = Object.keys(state.cache);
  if (keys.length > 20) {
    const oldest = keys.sort((a, b) => state.cache[a].timestamp - state.cache[b].timestamp);
    delete state.cache[oldest[0]];
  }
  await saveState(state);

  return response;
}

export default { askCoach, getRemainingMessages };
