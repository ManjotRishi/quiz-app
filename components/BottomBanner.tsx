import React, { useState } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import AppBannerAd from './AppBannerAd';

type Props = {
  style?: ViewStyle;
};

const BottomBanner = ({ style }: Props) => {
  const [hasVisibleAd, setHasVisibleAd] = useState(false);

  return (
    <View style={[styles.wrap, !hasVisibleAd ? styles.wrapCollapsed : null, style]}>
      <AppBannerAd
        placement="bottom-banner"
        containerStyle={styles.banner}
        horizontalInset={16}
        onAdLoaded={() => setHasVisibleAd(true)}
        onAdFailedToLoad={() => setHasVisibleAd(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: 'transparent',
  },
  wrapCollapsed: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  banner: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
});

export default BottomBanner;
