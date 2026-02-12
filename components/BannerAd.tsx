import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd as GADBannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { useApp } from '../contexts/AppContext';
import { getBannerAdUnitId } from '../services/ads';

interface Props {
  size?: BannerAdSize;
}

export default function BannerAd({ size = BannerAdSize.ANCHORED_ADAPTIVE_BANNER }: Props) {
  const { theme } = useApp();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GADBannerAd
        unitId={getBannerAdUnitId()}
        size={size}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
  },
});
