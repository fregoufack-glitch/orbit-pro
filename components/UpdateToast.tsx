import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useApp } from '../contexts/AppContext';
import { checkForUpdates, applyUpdate } from '../services/updates';
import { t } from '../i18n';

export default function UpdateToast() {
  const { theme } = useApp();
  const [visible, setVisible] = useState(false);
  const [applying, setApplying] = useState(false);
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkForUpdates().then(({ isAvailable }) => {
      if (isAvailable) {
        setVisible(true);
        Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      }
    });
  }, []);

  async function handleUpdate() {
    setApplying(true);
    await applyUpdate();
    setApplying(false);
  }

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.accent, opacity }]}>
      <Text style={[styles.text, { color: theme.text }]}>{t('update.available')}</Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.accent }]}
        onPress={handleUpdate}
        disabled={applying}
      >
        <Text style={styles.buttonText}>{applying ? '...' : t('update.restart')}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setVisible(false)}>
        <Text style={[styles.dismiss, { color: theme.textMuted }]}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  text: { flex: 1, fontSize: 14, fontWeight: '600' },
  button: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  buttonText: { color: '#0A0A0F', fontSize: 13, fontWeight: '700' },
  dismiss: { fontSize: 18, paddingLeft: 4 },
});
