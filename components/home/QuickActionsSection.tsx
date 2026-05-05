import React from 'react';
import { ImageBackground, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { styles } from './homeStyles';
import { HomeQuickAction, HomeQuickGridMetrics } from './homeTypes';

type QuickActionsSectionProps = {
  actions: HomeQuickAction[];
  quickGrid: HomeQuickGridMetrics;
  onNavigate: (route: string) => void;
};

const QuickActionsSection = ({ actions, quickGrid, onNavigate }: QuickActionsSectionProps) => (
  <>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Start Something New</Text>
      <Text style={styles.sectionText}>No image-based questions here. Just clean practice flows.</Text>
    </View>

    <View style={styles.quickActionRow}>
      {actions.map((item, index) => (
        <TouchableOpacity
          key={item.key}
          activeOpacity={0.92}
          style={[
            styles.quickTouch,
            {
              width: quickGrid.quickCardWidth,
              marginBottom: quickGrid.quickGap,
              marginRight: index % 2 === 0 ? quickGrid.quickGap : 0,
            },
          ]}
          onPress={() => onNavigate(item.route)}
        >
          <ImageBackground
            source={item.image}
            resizeMode="cover"
            imageStyle={styles.quickCardImage}
            style={[
              styles.quickCard,
              {
                minHeight: quickGrid.quickCardMinHeight,
                paddingHorizontal: quickGrid.quickCardPaddingHorizontal,
                paddingVertical: quickGrid.quickCardPaddingVertical,
              },
            ]}
          >
            <LinearGradient
              colors={['rgba(5,18,27,0.04)', 'rgba(5,18,27,0.14)', 'rgba(5,18,27,0.42)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.quickCardOverlay}
            />
            <View style={styles.quickCardTop}>
              <Text style={[styles.quickEyebrow, { fontSize: quickGrid.quickEyebrowFontSize }]}>Start now</Text>
            </View>
            <View
              style={[
                styles.quickCopy,
                styles.quickCopyPinned,
                item.key !== 'daily' ? styles.quickCopyLight : null,
              ]}
            >
              <Text
                style={[
                  styles.quickTitle,
                  {
                    fontSize: quickGrid.quickTitleFontSize,
                    lineHeight: quickGrid.quickTitleLineHeight,
                  },
                ]}
              >
                {item.title}
              </Text>
              <Text
                style={[
                  styles.quickMeta,
                  {
                    fontSize: quickGrid.quickMetaFontSize,
                    lineHeight: quickGrid.quickMetaLineHeight,
                  },
                ]}
              >
                {item.subtitle}
              </Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      ))}
    </View>
  </>
);

export default QuickActionsSection;
