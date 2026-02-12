import AsyncStorage from '@react-native-async-storage/async-storage';

const translations: Record<string, Record<string, string>> = {
  // ========== COMMON ==========
  'common.loading': { fr: 'Chargement...', en: 'Loading...' },
  'common.save': { fr: 'Enregistrer', en: 'Save' },
  'common.cancel': { fr: 'Annuler', en: 'Cancel' },
  'common.delete': { fr: 'Supprimer', en: 'Delete' },
  'common.edit': { fr: 'Modifier', en: 'Edit' },
  'common.add': { fr: 'Ajouter', en: 'Add' },
  'common.search': { fr: 'Rechercher...', en: 'Search...' },
  'common.confirm': { fr: 'Confirmer', en: 'Confirm' },
  'common.back': { fr: 'Retour', en: 'Back' },
  'common.next': { fr: 'Suivant', en: 'Next' },
  'common.skip': { fr: 'Passer', en: 'Skip' },
  'common.done': { fr: 'Terminé', en: 'Done' },
  'common.yes': { fr: 'Oui', en: 'Yes' },
  'common.no': { fr: 'Non', en: 'No' },
  'common.ok': { fr: 'OK', en: 'OK' },
  'common.error': { fr: 'Erreur', en: 'Error' },
  'common.success': { fr: 'Succès', en: 'Success' },
  'common.close': { fr: 'Fermer', en: 'Close' },
  'common.today': { fr: "Aujourd'hui", en: 'Today' },
  'common.yesterday': { fr: 'Hier', en: 'Yesterday' },
  'common.week': { fr: 'Semaine', en: 'Week' },
  'common.month': { fr: 'Mois', en: 'Month' },
  'common.all': { fr: 'Tout', en: 'All' },
  'common.free': { fr: 'Gratuit', en: 'Free' },
  'common.free': { fr: 'Gratuit', en: 'Free' },
  'common.install': { fr: 'Installer', en: 'Install' },
  'common.installed': { fr: 'Installé', en: 'Installed' },

  // ========== AUTH ==========
  'auth.login': { fr: 'Connexion', en: 'Login' },
  'auth.signup': { fr: 'Inscription', en: 'Sign Up' },
  'auth.email': { fr: 'Email', en: 'Email' },
  'auth.password': { fr: 'Mot de passe', en: 'Password' },
  'auth.pseudo': { fr: 'Pseudo', en: 'Username' },
  'auth.login_btn': { fr: 'Se connecter', en: 'Log In' },
  'auth.signup_btn': { fr: "S'inscrire", en: 'Sign Up' },
  'auth.no_account': { fr: 'Pas de compte ?', en: "Don't have an account?" },
  'auth.has_account': { fr: 'Déjà un compte ?', en: 'Already have an account?' },
  'auth.logout': { fr: 'Déconnexion', en: 'Log Out' },
  'auth.error_email': { fr: 'Email invalide', en: 'Invalid email' },
  'auth.error_password': { fr: '6 caractères minimum', en: '6 characters minimum' },
  'auth.error_pseudo': { fr: 'Pseudo requis', en: 'Username required' },
  'auth.welcome_back': { fr: 'Bon retour !', en: 'Welcome back!' },
  'auth.create_account': { fr: 'Créer un compte', en: 'Create account' },

  // ========== GDPR ==========
  'gdpr.title': { fr: 'Protection des données', en: 'Data Protection' },
  'gdpr.message': { fr: 'Orbit Pro collecte vos données pour améliorer votre expérience. Vos données sont stockées de manière sécurisée et ne sont jamais partagées avec des tiers. Vous pouvez supprimer votre compte à tout moment.', en: 'Orbit Pro collects your data to improve your experience. Your data is stored securely and never shared with third parties. You can delete your account at any time.' },
  'gdpr.accept': { fr: "J'accepte", en: 'I Accept' },
  'gdpr.decline': { fr: 'Refuser', en: 'Decline' },
  'gdpr.contact': { fr: 'Contact DPO : miguelfreddy65@gmail.com', en: 'DPO Contact: miguelfreddy65@gmail.com' },

  // ========== ONBOARDING ==========
  'onboarding.step1_title': { fr: 'Vos objectifs', en: 'Your Goals' },
  'onboarding.step1_subtitle': { fr: 'Que souhaitez-vous améliorer ?', en: 'What do you want to improve?' },
  'onboarding.obj_health': { fr: '🏃 Santé & Fitness', en: '🏃 Health & Fitness' },
  'onboarding.obj_productivity': { fr: '💼 Productivité', en: '💼 Productivity' },
  'onboarding.obj_mindfulness': { fr: '🧘 Bien-être mental', en: '🧘 Mindfulness' },
  'onboarding.obj_learning': { fr: '📚 Apprentissage', en: '📚 Learning' },
  'onboarding.obj_social': { fr: '👥 Relations sociales', en: '👥 Social' },
  'onboarding.obj_creativity': { fr: '🎨 Créativité', en: '🎨 Creativity' },
  'onboarding.step2_title': { fr: 'Routines suggérées', en: 'Suggested Routines' },
  'onboarding.step2_subtitle': { fr: 'Basées sur vos objectifs', en: 'Based on your goals' },
  'onboarding.step3_title': { fr: 'Notifications', en: 'Notifications' },
  'onboarding.step3_subtitle': { fr: 'Restez motivé avec des rappels', en: 'Stay motivated with reminders' },
  'onboarding.enable_notifications': { fr: 'Activer les notifications', en: 'Enable Notifications' },
  'onboarding.start': { fr: "C'est parti !", en: "Let's go!" },

  // ========== HOME ==========
  'home.greeting_morning': { fr: 'Bonjour', en: 'Good morning' },
  'home.greeting_afternoon': { fr: 'Bon après-midi', en: 'Good afternoon' },
  'home.greeting_evening': { fr: 'Bonsoir', en: 'Good evening' },
  'home.today_progress': { fr: "Progrès d'aujourd'hui", en: "Today's Progress" },
  'home.daily_missions': { fr: 'Missions du jour', en: 'Daily Missions' },
  'home.quick_actions': { fr: 'Actions rapides', en: 'Quick Actions' },
  'home.timeline': { fr: 'Chronologie', en: 'Timeline' },
  'home.no_habits': { fr: 'Aucune habitude encore', en: 'No habits yet' },
  'home.add_first': { fr: 'Ajoutez votre première habitude !', en: 'Add your first habit!' },
  'home.streak': { fr: 'Série', en: 'Streak' },
  'home.days': { fr: 'jours', en: 'days' },
  'home.level': { fr: 'Niveau', en: 'Level' },
  'home.xp': { fr: 'XP', en: 'XP' },
  'home.perfect_day': { fr: 'Journée parfaite !', en: 'Perfect day!' },

  // ========== HABITS ==========
  'habits.title': { fr: 'Habitudes', en: 'Habits' },
  'habits.add': { fr: 'Nouvelle habitude', en: 'New Habit' },
  'habits.name': { fr: "Nom de l'habitude", en: 'Habit name' },
  'habits.emoji': { fr: 'Emoji', en: 'Emoji' },
  'habits.color': { fr: 'Couleur', en: 'Color' },
  'habits.category': { fr: 'Catégorie', en: 'Category' },
  'habits.frequency': { fr: 'Fréquence', en: 'Frequency' },
  'habits.time': { fr: 'Heure cible', en: 'Target time' },
  'habits.duration': { fr: 'Durée (min)', en: 'Duration (min)' },
  'habits.daily': { fr: 'Quotidien', en: 'Daily' },
  'habits.weekdays': { fr: 'Jours ouvrés', en: 'Weekdays' },
  'habits.weekends': { fr: 'Week-end', en: 'Weekends' },
  'habits.custom': { fr: 'Personnalisé', en: 'Custom' },
  'habits.cat_health': { fr: 'Santé', en: 'Health' },
  'habits.cat_productivity': { fr: 'Productivité', en: 'Productivity' },
  'habits.cat_mindfulness': { fr: 'Bien-être', en: 'Wellness' },
  'habits.cat_learning': { fr: 'Apprentissage', en: 'Learning' },
  'habits.cat_social': { fr: 'Social', en: 'Social' },
  'habits.cat_creativity': { fr: 'Créativité', en: 'Creativity' },
  'habits.cat_general': { fr: 'Général', en: 'General' },
  'habits.swipe_delete': { fr: 'Glisser pour supprimer', en: 'Swipe to delete' },
  'habits.delete_confirm': { fr: 'Supprimer cette habitude ?', en: 'Delete this habit?' },
  'habits.completed': { fr: 'Terminé !', en: 'Completed!' },
  'habits.filter_all': { fr: 'Toutes', en: 'All' },
  'habits.filter_active': { fr: 'Actives', en: 'Active' },
  'habits.empty': { fr: 'Aucune habitude', en: 'No habits' },

  // ========== PLANNER ==========
  'planner.title': { fr: 'Planificateur', en: 'Planner' },
  'planner.day_view': { fr: 'Jour', en: 'Day' },
  'planner.week_view': { fr: 'Semaine', en: 'Week' },
  'planner.add_activity': { fr: 'Ajouter une activité', en: 'Add Activity' },
  'planner.activity_name': { fr: "Nom de l'activité", en: 'Activity name' },
  'planner.date': { fr: 'Date', en: 'Date' },
  'planner.start_time': { fr: 'Heure de début', en: 'Start time' },
  'planner.end_time': { fr: 'Heure de fin', en: 'End time' },
  'planner.no_activities': { fr: 'Aucune activité prévue', en: 'No planned activities' },

  // ========== STATS ==========
  'stats.title': { fr: 'Statistiques', en: 'Statistics' },
  'stats.overview': { fr: 'Vue d\'ensemble', en: 'Overview' },
  'stats.habits_completed': { fr: 'Habitudes complétées', en: 'Habits completed' },
  'stats.total_xp': { fr: 'XP total', en: 'Total XP' },
  'stats.best_streak': { fr: 'Meilleure série', en: 'Best streak' },
  'stats.perfect_days': { fr: 'Jours parfaits', en: 'Perfect days' },
  'stats.completion_rate': { fr: 'Taux de complétion', en: 'Completion rate' },
  'stats.weekly_chart': { fr: 'Cette semaine', en: 'This week' },
  'stats.per_habit': { fr: 'Par habitude', en: 'Per habit' },
  'stats.ai_insights': { fr: 'Insights IA', en: 'AI Insights' },
  'stats.badges': { fr: 'Badges', en: 'Badges' },
  'stats.no_data': { fr: 'Pas encore de données', en: 'No data yet' },

  // ========== PROFILE ==========
  'profile.title': { fr: 'Profil', en: 'Profile' },
  'profile.theme': { fr: 'Thème', en: 'Theme' },
  'profile.dark': { fr: 'Sombre', en: 'Dark' },
  'profile.light': { fr: 'Clair', en: 'Light' },
  'profile.language': { fr: 'Langue', en: 'Language' },
  'profile.accent_color': { fr: "Couleur d'accent", en: 'Accent Color' },
  'profile.custom_title': { fr: 'Titre personnalisé', en: 'Custom Title' },
  'profile.export_csv': { fr: 'Exporter en CSV', en: 'Export as CSV' },
  'profile.delete_account': { fr: 'Supprimer le compte', en: 'Delete Account' },
  'profile.delete_confirm': { fr: 'Cette action est irréversible. Toutes vos données seront supprimées.', en: 'This action is irreversible. All your data will be deleted.' },
  'profile.contact': { fr: 'Contact', en: 'Contact' },
  'profile.contact_email': { fr: 'miguelfreddy65@gmail.com', en: 'miguelfreddy65@gmail.com' },
  'profile.version': { fr: 'Version', en: 'Version' },


  // ========== MARKETPLACE ==========
  'marketplace.title': { fr: 'Marketplace', en: 'Marketplace' },
  'marketplace.subtitle': { fr: 'Routines prêtes à l\'emploi', en: 'Ready-to-use routines' },
  'marketplace.free_routines': { fr: 'Routines gratuites', en: 'Free Routines' },
  'marketplace.install_success': { fr: 'Routine installée !', en: 'Routine installed!' },
  'marketplace.habits_count': { fr: 'habitudes', en: 'habits' },

  // ========== SUPPORT ==========
  'support.title': { fr: 'Support', en: 'Support' },
  'support.faq': { fr: 'FAQ', en: 'FAQ' },
  'support.chatbot': { fr: 'Chatbot', en: 'Chatbot' },
  'support.contact_us': { fr: 'Nous contacter', en: 'Contact Us' },
  'support.email': { fr: 'miguelfreddy65@gmail.com', en: 'miguelfreddy65@gmail.com' },
  'support.faq_1_q': { fr: 'Comment créer une habitude ?', en: 'How to create a habit?' },
  'support.faq_1_a': { fr: 'Allez dans l\'onglet Habitudes et appuyez sur le bouton +.', en: 'Go to the Habits tab and tap the + button.' },
  'support.faq_2_q': { fr: 'Comment fonctionne le système XP ?', en: 'How does the XP system work?' },
  'support.faq_2_a': { fr: 'Gagnez 10 XP par habitude complétée, 50 XP pour une journée parfaite, et 20 XP bonus de série.', en: 'Earn 10 XP per completed habit, 50 XP for a perfect day, and 20 XP streak bonus.' },
  'support.faq_3_q': { fr: 'Orbit Pro est-il gratuit ?', en: 'Is Orbit Pro free?' },
  'support.faq_3_a': { fr: 'Oui ! Orbit Pro est 100% gratuit. Toutes les fonctionnalités sont accessibles sans paiement.', en: 'Yes! Orbit Pro is 100% free. All features are accessible without payment.' },
  'support.faq_4_q': { fr: 'Comment exporter mes données ?', en: 'How to export my data?' },
  'support.faq_4_a': { fr: 'Allez dans Profil > Exporter en CSV.', en: 'Go to Profile > Export as CSV.' },
  'support.faq_5_q': { fr: 'Comment supprimer mon compte ?', en: 'How to delete my account?' },
  'support.faq_5_a': { fr: 'Allez dans Profil > Supprimer le compte. Cette action est irréversible.', en: 'Go to Profile > Delete Account. This action is irreversible.' },
  'support.chatbot_greeting': { fr: 'Bonjour ! Comment puis-je vous aider ?', en: 'Hello! How can I help you?' },
  'support.chatbot_placeholder': { fr: 'Tapez votre message...', en: 'Type your message...' },

  // ========== AI COACH ==========
  'ai.title': { fr: 'Coach IA', en: 'AI Coach' },
  'ai.greeting': { fr: 'Je suis votre coach personnel ! Comment puis-je vous aider ?', en: "I'm your personal coach! How can I help?" },
  'ai.placeholder': { fr: 'Demandez-moi conseil...', en: 'Ask me for advice...' },
  'ai.quick_progress': { fr: '📊 Mon progrès', en: '📊 My Progress' },
  'ai.quick_plan_day': { fr: '📅 Planifier ma journée', en: '📅 Plan My Day' },
  'ai.quick_motivation': { fr: '💪 Motive-moi', en: '💪 Motivate Me' },
  'ai.quick_challenge': { fr: '🎯 Nouveau défi', en: '🎯 New Challenge' },
  'ai.quick_streak_tips': { fr: '🔥 Conseils streak', en: '🔥 Streak Tips' },
  'ai.quick_badges': { fr: '🏆 Mes badges', en: '🏆 My Badges' },

  // ========== GAMIFICATION ==========
  'game.xp_earned': { fr: 'XP gagnés !', en: 'XP earned!' },
  'game.level_up': { fr: 'Niveau supérieur !', en: 'Level up!' },
  'game.badge_earned': { fr: 'Badge débloqué !', en: 'Badge unlocked!' },
  'game.streak_bonus': { fr: 'Bonus de série !', en: 'Streak bonus!' },
  'game.perfect_day': { fr: 'Journée parfaite ! +50 XP', en: 'Perfect day! +50 XP' },
  'game.mission_complete': { fr: 'Mission accomplie !', en: 'Mission complete!' },
  'game.level_1': { fr: 'Débutant 🌱', en: 'Beginner 🌱' },
  'game.level_2': { fr: 'Apprenti 🌿', en: 'Apprentice 🌿' },
  'game.level_3': { fr: 'Pratiquant 🌳', en: 'Practitioner 🌳' },
  'game.level_4': { fr: 'Confirmé ⚡', en: 'Confirmed ⚡' },
  'game.level_5': { fr: 'Expert 🔥', en: 'Expert 🔥' },
  'game.level_6': { fr: 'Maître 💎', en: 'Master 💎' },
  'game.level_7': { fr: 'Grand Maître 🏆', en: 'Grand Master 🏆' },
  'game.level_8': { fr: 'Légende ⭐', en: 'Legend ⭐' },
  'game.level_9': { fr: 'Mythique 🌟', en: 'Mythic 🌟' },
  'game.level_10': { fr: 'Divin 👼', en: 'Divine 👼' },
  'game.level_11': { fr: 'Transcendant 👑', en: 'Transcendent 👑' },

  // ========== MISSIONS ==========
  'mission.complete_3': { fr: 'Compléter 3 habitudes', en: 'Complete 3 habits' },
  'mission.morning_routine': { fr: 'Routine matinale avant 9h', en: 'Morning routine before 9am' },
  'mission.streak_keeper': { fr: 'Maintenir votre série', en: 'Keep your streak' },
  'mission.plan_tomorrow': { fr: 'Planifier demain', en: 'Plan tomorrow' },

  // ========== TABS ==========
  'tab.home': { fr: 'Accueil', en: 'Home' },
  'tab.habits': { fr: 'Habitudes', en: 'Habits' },
  'tab.social': { fr: 'Social', en: 'Social' },
  'tab.planner': { fr: 'Planifier', en: 'Planner' },
  'tab.stats': { fr: 'Stats', en: 'Stats' },
  'tab.profile': { fr: 'Profil', en: 'Profile' },

  // ========== SOCIAL ==========
  'social.your_story': { fr: 'Votre story', en: 'Your Story' },
  'social.new_story': { fr: 'Nouvelle Story', en: 'New Story' },
  'social.share': { fr: 'Partager', en: 'Share' },
  'social.story_caption': { fr: 'Écrivez quelque chose...', en: 'Write something...' },
  'social.challenges': { fr: 'Défis', en: 'Challenges' },
  'social.challenges_subtitle': { fr: 'Défiez vos amis et progressez ensemble', en: 'Challenge friends and grow together' },
  'social.empty_feed': { fr: 'Ajoutez des amis pour voir leur activité', en: 'Add friends to see their activity' },
  'social.add_friends': { fr: 'Ajouter des amis', en: 'Add Friends' },
  'social.react': { fr: 'Réagir', en: 'React' },
  'social.just_now': { fr: "À l'instant", en: 'Just now' },
  'social.earned_badge': { fr: 'a débloqué un badge', en: 'earned a badge' },
  'social.streak_milestone': { fr: 'a atteint une série de {count} jours !', en: 'hit a {count}-day streak!' },
  'social.level_up': { fr: 'est passé au niveau {level} !', en: 'leveled up to {level}!' },
  'social.perfect_day': { fr: 'a eu une journée parfaite !', en: 'had a perfect day!' },
  'social.completed_habit': { fr: 'a complété {habit}', en: 'completed {habit}' },
  'social.conversations': { fr: 'Conversations', en: 'Conversations' },
  'social.no_conversations': { fr: 'Aucune conversation', en: 'No conversations' },
  'social.no_messages_yet': { fr: 'Pas encore de message', en: 'No messages yet' },
  'social.type_message': { fr: 'Tapez un message...', en: 'Type a message...' },
  'social.start_conversation': { fr: 'Envoyez un premier message !', en: 'Send the first message!' },
  'social.shared_achievement': { fr: 'a partagé un accomplissement', en: 'shared an achievement' },
  'social.group': { fr: 'Groupe', en: 'Group' },
  'social.tap_for_info': { fr: 'Appuyer pour les détails', en: 'Tap for info' },
  'social.group_start': { fr: 'Bienvenue dans le groupe !', en: 'Welcome to the group!' },
  'social.create_group': { fr: 'Créer un groupe', en: 'Create Group' },
  'social.group_name': { fr: 'Nom du groupe', en: 'Group name' },
  'social.group_name_required': { fr: 'Le nom du groupe est requis', en: 'Group name is required' },
  'social.select_members': { fr: 'Sélectionner des membres', en: 'Select members' },
  'social.create_group_error': { fr: 'Erreur lors de la création', en: 'Error creating group' },
  'social.no_friends': { fr: 'Aucun ami encore', en: 'No friends yet' },
  'social.group_info': { fr: 'Info du groupe', en: 'Group Info' },
  'social.members': { fr: 'membres', en: 'members' },
  'social.you': { fr: 'vous', en: 'you' },
  'social.admin': { fr: 'Admin', en: 'Admin' },
  'social.member': { fr: 'Membre', en: 'Member' },
  'social.leave_group': { fr: 'Quitter le groupe', en: 'Leave Group' },
  'social.leave_group_confirm': { fr: 'Voulez-vous vraiment quitter ce groupe ?', en: 'Are you sure you want to leave?' },
  'social.leave': { fr: 'Quitter', en: 'Leave' },
  'social.delete_group': { fr: 'Supprimer le groupe', en: 'Delete Group' },
  'social.delete_group_confirm': { fr: 'Cette action est irréversible.', en: 'This action is irreversible.' },
  'social.remove_member': { fr: 'Retirer le membre', en: 'Remove Member' },
  'social.remove_member_confirm': { fr: 'Retirer', en: 'Remove' },
  'social.no_friends_to_add': { fr: 'Aucun ami à ajouter', en: 'No friends to add' },
  'social.friends_title': { fr: 'Amis', en: 'Friends' },
  'social.add_by_username': { fr: "Ajouter par nom d'utilisateur", en: 'Add by username' },
  'social.friends_tab': { fr: 'Amis', en: 'Friends' },
  'social.requests_tab': { fr: 'Demandes', en: 'Requests' },
  'social.request_sent': { fr: 'Demande envoyée !', en: 'Request sent!' },
  'social.wants_to_be_friends': { fr: 'veut devenir ami', en: 'wants to be friends' },
  'social.no_requests': { fr: 'Aucune demande', en: 'No requests' },
  'social.block_user': { fr: "Bloquer l'utilisateur", en: 'Block User' },
  'social.block_confirm': { fr: 'Bloquer', en: 'Block' },
  'social.block': { fr: 'Bloquer', en: 'Block' },
  'social.remove_friend': { fr: "Retirer l'ami", en: 'Remove Friend' },
  'social.remove_friend_confirm': { fr: 'Retirer', en: 'Remove' },
  'social.no_challenges': { fr: 'Aucun défi actif', en: 'No active challenges' },
  'social.create_first_challenge': { fr: 'Créer un premier défi', en: 'Create first challenge' },
  'social.create_challenge': { fr: 'Créer un défi', en: 'Create Challenge' },
  'social.challenge_name_required': { fr: 'Le nom est requis', en: 'Name is required' },
  'social.challenge_habit_name': { fr: "Nom de l'habitude", en: 'Habit name' },
  'social.challenge_description': { fr: 'Description (optionnel)', en: 'Description (optional)' },
  'social.challenge_duration': { fr: 'Durée', en: 'Duration' },
  'social.days_left': { fr: 'jours restants', en: 'days left' },
  'social.participants': { fr: 'participants', en: 'participants' },
  'social.join_challenge': { fr: 'Rejoindre', en: 'Join Challenge' },
  'social.joined_challenge': { fr: 'Vous avez rejoint le défi !', en: 'You joined the challenge!' },
  'social.log_progress': { fr: 'Enregistrer le progrès', en: 'Log Progress' },
  'social.profile_private': { fr: 'Ce profil est privé', en: 'This profile is private' },
  'social.profile_friends_only': { fr: 'Profil visible par les amis uniquement', en: 'Profile visible to friends only' },
  'social.badge_showcase': { fr: 'Badges en vedette', en: 'Badge Showcase' },
  'social.send_message': { fr: 'Envoyer un message', en: 'Send Message' },
  'social.not_friends_yet': { fr: 'Vous n\'êtes pas encore amis', en: 'You\'re not friends yet' },

  // ========== PERSONALIZATION ==========
  'profile.personalization': { fr: 'Personnalisation', en: 'Personalization' },
  'profile.avatar_presets': { fr: 'Avatars', en: 'Avatars' },
  'profile.banner': { fr: 'Bannière', en: 'Banner' },
  'profile.bio': { fr: 'Bio', en: 'Bio' },
  'profile.bio_placeholder': { fr: 'Parlez de vous...', en: 'Tell us about yourself...' },
  'profile.mood_status': { fr: 'Humeur / Statut', en: 'Mood / Status' },
  'profile.custom_mood': { fr: 'Statut personnalisé', en: 'Custom status' },
  'profile.badge_showcase_title': { fr: 'Badges en vedette', en: 'Badge Showcase' },
  'profile.max_badges': { fr: '3 badges maximum', en: 'Maximum 3 badges' },
  'profile.no_badges_yet': { fr: 'Pas encore de badges', en: 'No badges yet' },
  'profile.streak_style': { fr: '🔥 Style de série', en: '🔥 Streak Style' },
  'profile.card_style': { fr: '🃏 Style de carte', en: '🃏 Card Style' },
  'profile.animation_style': { fr: '✨ Style d\'animation', en: '✨ Animation Style' },
  'profile.notification_sound': { fr: 'Son de notification', en: 'Notification Sound' },
  'profile.privacy': { fr: 'Confidentialité', en: 'Privacy' },
  'profile.privacy_public': { fr: 'Public — visible par tous', en: 'Public — visible to everyone' },
  'profile.privacy_friends': { fr: 'Amis uniquement', en: 'Friends only' },
  'profile.privacy_private': { fr: 'Privé — vous seul', en: 'Private — only you' },

  // ========== ADS ==========
  'ads.rewarded_xp_button': { fr: '🎬 +50 XP bonus', en: '🎬 +50 XP bonus' },
  'ads.daily_limit': { fr: 'Limite quotidienne atteinte', en: 'Daily limit reached' },

  // ========== FOCUS MODE ==========
  'focus.title': { fr: 'Focus', en: 'Focus' },
  'focus.start': { fr: 'Démarrer', en: 'Start' },
  'focus.stop': { fr: 'Arrêter', en: 'Stop' },
  'focus.restart': { fr: 'Recommencer', en: 'Restart' },
  'focus.completed': { fr: 'Terminé !', en: 'Completed!' },
  'focus.link_habit': { fr: 'Lier à une habitude', en: 'Link to a habit' },
  'focus.bonus_ad': { fr: '🎬 +20 XP bonus', en: '🎬 +20 XP bonus' },
  'focus.bonus': { fr: 'Bonus', en: 'Bonus' },
  'focus.break': { fr: 'Pause', en: 'Break' },
  'focus.work': { fr: 'Focus', en: 'Focus' },
  'notif.missed_habit': { fr: "Tu n'as pas fait {habit} depuis 3 jours. Veux-tu ajuster l'horaire ?", en: "You haven't done {habit} in 3 days. Want to adjust the schedule?" },
  'notif.streak_freeze': { fr: '🧊 Ton gel de série a sauvé ta série de {count} jours !', en: '🧊 Your streak freeze saved your {count}-day streak!' },
  'notif.quiet_hours': { fr: 'Mode silencieux actif', en: 'Quiet mode active' },
  'secret_badge.unlocked': { fr: '🤫 Badge secret débloqué : {name} !', en: '🤫 Secret badge unlocked: {name}!' },

  // ========== WEEKLY REPORT ==========
  'weekly.title': { fr: 'Rapport hebdo', en: 'Weekly Report' },
  'weekly.completed': { fr: 'Complétées', en: 'Completed' },
  'weekly.xp_earned': { fr: 'XP gagnés', en: 'XP Earned' },
  'weekly.perfect_days': { fr: 'Jours parfaits', en: 'Perfect Days' },
  'weekly.streak': { fr: 'Série', en: 'Streak' },
  'weekly.best_day': { fr: 'Meilleur jour', en: 'Best Day' },
  'weekly.most_consistent': { fr: 'Plus régulière', en: 'Most Consistent' },

  // ========== MOOD CHECK-IN ==========
  'mood.title': { fr: 'Comment ça va ?', en: 'How are you feeling?' },
  'mood.subtitle': { fr: 'Check-in quotidien', en: 'Daily check-in' },
  'mood.note_placeholder': { fr: 'Note optionnelle...', en: 'Optional note...' },

  // ========== STATS EXTRAS ==========
  'stats.heatmap': { fr: 'Activité', en: 'Activity' },
  'stats.mood_correlation': { fr: 'Humeur & habitudes', en: 'Mood & Habits' },

  // ========== STREAK FREEZE ==========
  'streak_freeze.title': { fr: 'Gel de série', en: 'Streak Freeze' },
  'streak_freeze.active': { fr: '🧊 Gel de série activé !', en: '🧊 Streak freeze activated!' },
  'streak_freeze.available': { fr: '🧊 1 gel disponible', en: '🧊 1 freeze available' },
  'streak_freeze.recharge': { fr: '🎬 Recharger un gel', en: '🎬 Recharge freeze' },
  'streak_freeze.none': { fr: 'Aucun gel disponible', en: 'No freeze available' },

  // ========== ENCOURAGEMENT ==========
  'social.encourage': { fr: 'Encourager', en: 'Encourage' },
  'social.encouraged': { fr: 't\'encourage ! 👏', en: 'cheers you on! 👏' },

  // ========== QUIET HOURS ==========
  'settings.quiet_hours': { fr: 'Heures calmes', en: 'Quiet Hours' },
  'settings.quiet_hours_desc': { fr: 'Pas de notifications pendant ces heures', en: 'No notifications during these hours' },

  // ========== ADS ==========
  'ads.watchAdForXP': { fr: 'Regarde une pub pour +{xp} XP', en: 'Watch an ad for +{xp} XP' },
  'ads.adRewardEarned': { fr: 'Tu as gagné {xp} XP bonus !', en: 'You earned {xp} bonus XP!' },
  'ads.dailyAdLimitReached': { fr: 'Limite quotidienne atteinte, reviens demain !', en: 'Daily limit reached, come back tomorrow!' },
  'ads.doubleXP': { fr: 'Doubler mes XP', en: 'Double my XP' },
  'ads.rechargeFreeze': { fr: 'Recharger mon streak freeze', en: 'Recharge my streak freeze' },
  'ads.adLoading': { fr: 'Chargement...', en: 'Loading...' },
  'ads.remainingToday': { fr: 'restantes aujourd\'hui', en: 'remaining today' },
  'ads.focusBonus': { fr: 'Session terminée ! +{xp} XP bonus', en: 'Session complete! +{xp} bonus XP' },
  'ads.perfectDay': { fr: 'Journée parfaite ! Doubler tes XP', en: 'Perfect day! Double your XP' },
  'ads.unlockDetailedStats': { fr: 'Débloquer des stats détaillées', en: 'Unlock detailed stats' },

  // ========== OTA UPDATES ==========
  'update.available': { fr: '🔄 Mise à jour disponible', en: '🔄 Update available' },
  'update.restart': { fr: 'Redémarrer', en: 'Restart' },
  'update.restartToApply': { fr: 'Redémarrer pour appliquer', en: 'Restart to apply' },
  'update.updating': { fr: 'Mise à jour en cours...', en: 'Updating...' },
  'update.upToDate': { fr: "L'app est à jour !", en: 'App is up to date!' },
};

let currentLanguage = 'fr';

export function setLanguage(lang: string) {
  currentLanguage = lang;
  AsyncStorage.setItem('orbit_language', lang);
}

export function getLanguage(): string {
  return currentLanguage;
}

export async function loadLanguage(): Promise<string> {
  const saved = await AsyncStorage.getItem('orbit_language');
  if (saved) {
    currentLanguage = saved;
  }
  return currentLanguage;
}

export function t(key: string): string {
  const entry = translations[key];
  if (!entry) return key;
  return entry[currentLanguage] || entry['en'] || key;
}

export default { t, setLanguage, getLanguage, loadLanguage };
