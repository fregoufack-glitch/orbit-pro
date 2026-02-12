import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../../contexts/AppContext';
import { t } from '../../i18n';

export default function SignupScreen() {
  const router = useRouter();
  const { signUp, theme } = useApp();
  const [pseudo, setPseudo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    setError('');
    if (!pseudo.trim()) { setError(t('auth.error_pseudo')); return; }
    if (!email.includes('@')) { setError(t('auth.error_email')); return; }
    if (password.length < 6) { setError(t('auth.error_password')); return; }

    setLoading(true);
    const result = await signUp(email, password, pseudo);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      router.replace('/onboarding');
    }
  }

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: theme.background }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <Text style={styles.logo}>🪐</Text>
        <Text style={[styles.title, { color: theme.text }]}>Orbit Pro</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{t('auth.create_account')}</Text>

        {error ? <Text style={[styles.error, { color: theme.error }]}>{error}</Text> : null}

        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          placeholder={t('auth.pseudo')}
          placeholderTextColor={theme.textMuted}
          value={pseudo}
          onChangeText={setPseudo}
        />

        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          placeholder={t('auth.email')}
          placeholderTextColor={theme.textMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          placeholder={t('auth.password')}
          placeholderTextColor={theme.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.accent }]}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0A0E1A" />
          ) : (
            <Text style={styles.buttonText}>{t('auth.signup_btn')}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/auth/login')}>
          <Text style={[styles.link, { color: theme.textSecondary }]}>
            {t('auth.has_account')} <Text style={{ color: theme.accent }}>{t('auth.login')}</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  logo: { fontSize: 60, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 32, fontWeight: '900', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 32 },
  error: { fontSize: 14, textAlign: 'center', marginBottom: 16, fontWeight: '600' },
  input: {
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  button: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonText: { color: '#0A0E1A', fontSize: 17, fontWeight: '700' },
  link: { fontSize: 15, textAlign: 'center' },
});
