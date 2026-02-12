export const ACCENT_COLORS = [
  '#00D9A5', // Neon Green (default)
  '#FF6B6B', // Coral Red
  '#4ECDC4', // Teal
  '#FFE66D', // Yellow
  '#A78BFA', // Purple
  '#F472B6', // Pink
  '#60A5FA', // Blue
  '#FB923C', // Orange
];

export const darkTheme = {
  background: '#0A0E1A',
  surface: '#141929',
  surfaceLight: '#1E2438',
  text: '#FFFFFF',
  textSecondary: '#8B95B0',
  textMuted: '#4A5270',
  border: '#252B3F',
  accent: '#00D9A5',
  error: '#FF6B6B',
  success: '#00D9A5',
  warning: '#FFE66D',
  card: '#141929',
  overlay: 'rgba(0,0,0,0.7)',
};

export const lightTheme = {
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceLight: '#F0F2F5',
  text: '#1A1D29',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  accent: '#00D9A5',
  error: '#EF4444',
  success: '#00D9A5',
  warning: '#F59E0B',
  card: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.5)',
};

export type Theme = typeof darkTheme;

export const LEVELS = [
  { level: 1, name: 'game.level_1', xpRequired: 0 },
  { level: 2, name: 'game.level_2', xpRequired: 100 },
  { level: 3, name: 'game.level_3', xpRequired: 300 },
  { level: 4, name: 'game.level_4', xpRequired: 600 },
  { level: 5, name: 'game.level_5', xpRequired: 1000 },
  { level: 6, name: 'game.level_6', xpRequired: 1500 },
  { level: 7, name: 'game.level_7', xpRequired: 2500 },
  { level: 8, name: 'game.level_8', xpRequired: 4000 },
  { level: 9, name: 'game.level_9', xpRequired: 6000 },
  { level: 10, name: 'game.level_10', xpRequired: 9000 },
  { level: 11, name: 'game.level_11', xpRequired: 13000 },
];

export const BADGES = [
  { id: 'first_habit', emoji: '🌱', name: { fr: 'Premier pas', en: 'First Step' }, desc: { fr: 'Créer votre première habitude', en: 'Create your first habit' } },
  { id: 'streak_3', emoji: '🔥', name: { fr: 'En feu', en: 'On Fire' }, desc: { fr: 'Série de 3 jours', en: '3-day streak' } },
  { id: 'streak_7', emoji: '⚡', name: { fr: 'Semaine parfaite', en: 'Perfect Week' }, desc: { fr: 'Série de 7 jours', en: '7-day streak' } },
  { id: 'streak_30', emoji: '💎', name: { fr: 'Diamant', en: 'Diamond' }, desc: { fr: 'Série de 30 jours', en: '30-day streak' } },
  { id: 'perfect_day_1', emoji: '⭐', name: { fr: 'Jour parfait', en: 'Perfect Day' }, desc: { fr: 'Première journée parfaite', en: 'First perfect day' } },
  { id: 'perfect_day_10', emoji: '🌟', name: { fr: 'Étoile montante', en: 'Rising Star' }, desc: { fr: '10 journées parfaites', en: '10 perfect days' } },
  { id: 'xp_500', emoji: '🏅', name: { fr: 'Demi-millier', en: 'Half K' }, desc: { fr: 'Atteindre 500 XP', en: 'Reach 500 XP' } },
  { id: 'xp_1000', emoji: '🏆', name: { fr: 'Millénaire', en: 'Millennial' }, desc: { fr: 'Atteindre 1000 XP', en: 'Reach 1000 XP' } },
  { id: 'habits_5', emoji: '📋', name: { fr: 'Organisé', en: 'Organized' }, desc: { fr: 'Créer 5 habitudes', en: 'Create 5 habits' } },
  { id: 'habits_10', emoji: '🎯', name: { fr: 'Maître des habitudes', en: 'Habit Master' }, desc: { fr: 'Créer 10 habitudes', en: 'Create 10 habits' } },
  { id: 'early_bird', emoji: '🐦', name: { fr: 'Lève-tôt', en: 'Early Bird' }, desc: { fr: 'Compléter une habitude avant 7h', en: 'Complete a habit before 7am' } },
  { id: 'night_owl', emoji: '🦉', name: { fr: 'Noctambule', en: 'Night Owl' }, desc: { fr: 'Compléter une habitude après 22h', en: 'Complete a habit after 10pm' } },
];

export const MARKETPLACE_ROUTINES = [
  {
    id: 'morning_energy',
    emoji: '☀️',
    name: { fr: 'Routine Matinale Énergie', en: 'Morning Energy Routine' },
    desc: { fr: 'Commencez chaque journée avec énergie', en: 'Start every day with energy' },
    habits: [
      { name: { fr: 'Méditation 5 min', en: '5 min Meditation' }, emoji: '🧘', color: '#A78BFA', category: 'mindfulness', duration: 5 },
      { name: { fr: 'Exercice 15 min', en: '15 min Exercise' }, emoji: '💪', color: '#FF6B6B', category: 'health', duration: 15 },
      { name: { fr: 'Petit-déjeuner sain', en: 'Healthy Breakfast' }, emoji: '🥗', color: '#00D9A5', category: 'health', duration: 20 },
    ],
  },
  {
    id: 'productivity_boost',
    emoji: '🚀',
    name: { fr: 'Boost Productivité', en: 'Productivity Boost' },
    desc: { fr: 'Maximisez votre productivité quotidienne', en: 'Maximize your daily productivity' },
    habits: [
      { name: { fr: 'Planifier la journée', en: 'Plan the day' }, emoji: '📋', color: '#60A5FA', category: 'productivity', duration: 10 },
      { name: { fr: 'Deep work 2h', en: '2h Deep work' }, emoji: '🎯', color: '#F472B6', category: 'productivity', duration: 120 },
      { name: { fr: 'Revue du soir', en: 'Evening review' }, emoji: '📝', color: '#FFE66D', category: 'productivity', duration: 10 },
    ],
  },
  {
    id: 'zen_life',
    emoji: '🧘',
    name: { fr: 'Vie Zen', en: 'Zen Life' },
    desc: { fr: 'Trouvez la paix intérieure', en: 'Find inner peace' },
    habits: [
      { name: { fr: 'Méditation 10 min', en: '10 min Meditation' }, emoji: '🧘', color: '#A78BFA', category: 'mindfulness', duration: 10 },
      { name: { fr: 'Journal de gratitude', en: 'Gratitude journal' }, emoji: '📖', color: '#4ECDC4', category: 'mindfulness', duration: 5 },
      { name: { fr: 'Respiration profonde', en: 'Deep breathing' }, emoji: '🌬️', color: '#60A5FA', category: 'mindfulness', duration: 5 },
    ],
  },
  {
    id: 'student_success',
    emoji: '📚',
    name: { fr: 'Succès Étudiant', en: 'Student Success' },
    desc: { fr: 'Excellez dans vos études', en: 'Excel in your studies' },
    habits: [
      { name: { fr: 'Révision 30 min', en: '30 min Revision' }, emoji: '📚', color: '#FFE66D', category: 'learning', duration: 30 },
      { name: { fr: 'Lecture 20 min', en: '20 min Reading' }, emoji: '📖', color: '#4ECDC4', category: 'learning', duration: 20 },
      { name: { fr: 'Vocabulaire', en: 'Vocabulary' }, emoji: '🔤', color: '#F472B6', category: 'learning', duration: 15 },
    ],
  },
  {
    id: 'fitness_warrior',
    emoji: '🏋️',
    name: { fr: 'Guerrier Fitness', en: 'Fitness Warrior' },
    desc: { fr: 'Transformez votre corps', en: 'Transform your body' },
    habits: [
      { name: { fr: 'Musculation 45 min', en: '45 min Workout' }, emoji: '🏋️', color: '#FF6B6B', category: 'health', duration: 45 },
      { name: { fr: 'Stretching 10 min', en: '10 min Stretching' }, emoji: '🤸', color: '#A78BFA', category: 'health', duration: 10 },
      { name: { fr: 'Protéines', en: 'Protein intake' }, emoji: '🥩', color: '#FB923C', category: 'health', duration: 5 },
      { name: { fr: 'Hydratation 2L', en: '2L Hydration' }, emoji: '💧', color: '#60A5FA', category: 'health', duration: 0 },
    ],
  },
  {
    id: 'creative_spark',
    emoji: '🎨',
    name: { fr: 'Étincelle Créative', en: 'Creative Spark' },
    desc: { fr: 'Libérez votre créativité', en: 'Unleash your creativity' },
    habits: [
      { name: { fr: 'Dessin 20 min', en: '20 min Drawing' }, emoji: '✏️', color: '#F472B6', category: 'creativity', duration: 20 },
      { name: { fr: 'Écriture libre 15 min', en: '15 min Free writing' }, emoji: '✍️', color: '#A78BFA', category: 'creativity', duration: 15 },
      { name: { fr: 'Inspiration visuelle', en: 'Visual inspiration' }, emoji: '🖼️', color: '#4ECDC4', category: 'creativity', duration: 10 },
    ],
  },
  {
    id: 'digital_detox',
    emoji: '📵',
    name: { fr: 'Détox Numérique', en: 'Digital Detox' },
    desc: { fr: 'Réduisez le temps d\'écran', en: 'Reduce screen time' },
    habits: [
      { name: { fr: 'Pas de téléphone 1h matin', en: 'No phone 1h morning' }, emoji: '📵', color: '#FF6B6B', category: 'mindfulness', duration: 60 },
      { name: { fr: 'Lire un livre', en: 'Read a book' }, emoji: '📕', color: '#FFE66D', category: 'learning', duration: 30 },
      { name: { fr: 'Promenade sans écran', en: 'Screen-free walk' }, emoji: '🚶', color: '#00D9A5', category: 'health', duration: 20 },
    ],
  },
  {
    id: 'social_butterfly',
    emoji: '🦋',
    name: { fr: 'Papillon Social', en: 'Social Butterfly' },
    desc: { fr: 'Renforcez vos liens sociaux', en: 'Strengthen social bonds' },
    habits: [
      { name: { fr: 'Appeler un ami', en: 'Call a friend' }, emoji: '📞', color: '#60A5FA', category: 'social', duration: 15 },
      { name: { fr: 'Acte de gentillesse', en: 'Act of kindness' }, emoji: '❤️', color: '#F472B6', category: 'social', duration: 5 },
      { name: { fr: 'Écoute active', en: 'Active listening' }, emoji: '👂', color: '#4ECDC4', category: 'social', duration: 10 },
    ],
  },
];

export const SECRET_BADGES = [
  { id: 'secret_noctambule', emoji: '🦉', secret: true, name: { fr: 'Noctambule', en: 'Night Owl' }, desc: { fr: 'Compléter une habitude entre 00h et 05h', en: 'Complete a habit between 12am and 5am' } },
  { id: 'secret_leve_tot', emoji: '🌅', secret: true, name: { fr: 'Lève-tôt', en: 'Early Riser' }, desc: { fr: 'Compléter avant 06h, 7 jours d\'affilée', en: 'Complete before 6am, 7 days straight' } },
  { id: 'secret_speed_runner', emoji: '⚡', secret: true, name: { fr: 'Speed Runner', en: 'Speed Runner' }, desc: { fr: '5 habitudes en moins de 10 min', en: '5 habits in under 10 min' } },
  { id: 'secret_perfectionniste', emoji: '🎯', secret: true, name: { fr: 'Perfectionniste', en: 'Perfectionist' }, desc: { fr: '100% pendant 30 jours', en: '100% for 30 days' } },
  { id: 'secret_discret', emoji: '🤫', secret: true, name: { fr: 'Discret', en: 'Discreet' }, desc: { fr: 'Utiliser l\'app 7 jours sans poster de story', en: 'Use app for 7 days without posting stories' } },
];

export function getLevelForXP(xp: number) {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.xpRequired) {
      current = level;
    } else {
      break;
    }
  }
  const nextLevel = LEVELS.find(l => l.level === current.level + 1);
  const xpForNext = nextLevel ? nextLevel.xpRequired - current.xpRequired : 0;
  const xpProgress = nextLevel ? xp - current.xpRequired : 0;
  return { ...current, xpForNext, xpProgress, nextLevel };
}
