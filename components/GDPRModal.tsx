import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useApp } from '../contexts/AppContext';
import { t } from '../i18n';

export default function GDPRModal() {
  const { gdprAccepted, acceptGDPR, theme } = useApp();

  if (gdprAccepted) return null;

  return (
    <Modal visible={!gdprAccepted} animationType="slide" transparent>
      <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
        <View style={[styles.modal, { backgroundColor: theme.surface }]}>
          <Text style={[styles.icon]}>🔒</Text>
          <Text style={[styles.title, { color: theme.text }]}>{t('gdpr.title')}</Text>
          <ScrollView style={styles.scroll}>
            <Text style={[styles.message, { color: theme.textSecondary }]}>{t('gdpr.message')}</Text>
            <Text style={[styles.contact, { color: theme.textMuted }]}>{t('gdpr.contact')}</Text>
          </ScrollView>
          <TouchableOpacity
            style={[styles.acceptBtn, { backgroundColor: theme.accent }]}
            onPress={acceptGDPR}
          >
            <Text style={styles.acceptText}>{t('gdpr.accept')}</Text>
          </TouchableOpacity>
          <Text style={[styles.note, { color: theme.textMuted }]}>
            {t('gdpr.contact')}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxHeight: '70%',
    alignItems: 'center',
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 16,
    textAlign: 'center',
  },
  scroll: {
    maxHeight: 200,
    marginBottom: 20,
  },
  message: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
  },
  contact: {
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
  },
  acceptBtn: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  acceptText: {
    color: '#0A0E1A',
    fontSize: 17,
    fontWeight: '700',
  },
  note: {
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center',
  },
});
