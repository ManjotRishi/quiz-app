import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { BookmarkOutlineIcon, ClockIcon, DownloadOutlineIcon, VoiceIcon } from './icons';
import { radiusScale, spaceScale } from '../style/responsive';

type QuestionExportControlsProps = {
  onPressDownload?: () => void;
  onPressFavourite?: () => void;
  onPressSound?: () => void;
  onPressVoice?: () => void;
  compact?: boolean;
  favourited?: boolean;
  favouriteLoading?: boolean;
  soundMuted?: boolean;
  voiceMuted?: boolean;
  showSound?: boolean;
  showVoice?: boolean;
  soundDisabled?: boolean;
  voiceDisabled?: boolean;
  variant?: 'darkPanel' | 'lightPanel';
  buttonSize?: number;
  iconSize?: number;
  gap?: number;
};

const QuestionExportControls = ({
  onPressDownload,
  onPressFavourite,
  onPressSound,
  onPressVoice,
  compact = false,
  favourited = false,
  favouriteLoading = false,
  soundMuted = false,
  voiceMuted = false,
  showSound = false,
  showVoice = false,
  soundDisabled = false,
  voiceDisabled = false,
  variant = 'darkPanel',
  buttonSize: buttonSizeOverride,
  iconSize: iconSizeOverride,
  gap,
}: QuestionExportControlsProps) => {
  const isLightPanel = variant === 'lightPanel';
  const buttonSize = buttonSizeOverride ?? (compact ? spaceScale(32) : isLightPanel ? spaceScale(42) : spaceScale(38));
  const iconSize = iconSizeOverride ?? (compact ? 15 : isLightPanel ? 19 : 17);
  const buttonInnerSize = buttonSize - 2;
  const mutedColors = isLightPanel
    ? ['#8BA0AA', '#B4C0C6']
    : ['rgba(98,112,122,0.94)', 'rgba(133,149,159,0.9)'];
  const soundColors = soundMuted
    ? mutedColors
    : isLightPanel
      ? ['#0A9FB0', '#3FC6D0', '#F7B24D']
      : ['rgba(14,165,233,0.92)', 'rgba(45,212,191,0.88)', 'rgba(251,146,60,0.84)'];
  const voiceColors = voiceMuted
    ? mutedColors
    : isLightPanel
      ? ['#159E8C', '#31C3AE', '#F4A259']
      : ['rgba(20,184,166,0.92)', 'rgba(56,189,248,0.88)', 'rgba(249,115,22,0.84)'];
  const downloadColors = isLightPanel
    ? ['#0E8FA1', '#73C4C0', '#F4B36F']
    : ['rgba(37,99,235,0.92)', 'rgba(14,165,233,0.86)', 'rgba(45,212,191,0.82)'];
  const favouriteColors = favourited
    ? ['#F59E0B', '#FB7185', '#8B5CF6']
    : isLightPanel
      ? ['#127A88', '#24B6A4', '#5BC6C8']
      : ['rgba(20,184,166,0.92)', 'rgba(56,189,248,0.86)', 'rgba(125,211,252,0.82)'];

  const renderButton = ({
    onPress,
    disabled = false,
    colors,
    children,
  }: {
    onPress?: () => void;
    disabled?: boolean;
    colors: string[];
    children: React.ReactNode;
  }) => (
    <TouchableOpacity
      activeOpacity={0.82}
      disabled={disabled}
      hitSlop={6}
      onPress={onPress}
      style={[
        styles.actionButton,
        isLightPanel ? styles.actionButtonLight : styles.actionButtonDark,
        disabled && styles.actionButtonDisabled,
        { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 },
      ]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.iconFill,
          disabled && styles.iconFillMuted,
          { width: buttonInnerSize, height: buttonInnerSize, borderRadius: buttonInnerSize / 2 },
        ]}
      >
        {children}
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.row, compact && styles.rowCompact, gap ? { gap } : null]}>
      {showSound
        ? renderButton({
            onPress: onPressSound,
            disabled: soundDisabled,
            colors: soundColors,
            children: <ClockIcon muted={soundMuted} size={iconSize} color="#F8FBFF" />,
          })
        : null}
      {showVoice
        ? renderButton({
            onPress: onPressVoice,
            disabled: voiceDisabled,
            colors: voiceColors,
            children: <VoiceIcon muted={voiceMuted || voiceDisabled} size={iconSize} color="#F8FBFF" />,
          })
        : null}
      {renderButton({
        onPress: onPressDownload,
        colors: downloadColors,
        children: <DownloadOutlineIcon size={iconSize} color="#F8FBFF" />,
      })}
      {renderButton({
        onPress: onPressFavourite,
        disabled: favouriteLoading,
        colors: favouriteColors,
        children: favouriteLoading ? (
          <ActivityIndicator color="#F8FBFF" size="small" />
        ) : (
          <BookmarkOutlineIcon filled={favourited} size={iconSize} color="#F8FBFF" />
        ),
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spaceScale(8),
  },
  rowCompact: {
    justifyContent: 'center',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  actionButtonDisabled: {
    opacity: 0.78,
  },
  actionButtonDark: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderColor: 'rgba(255,255,255,0.16)',
  },
  actionButtonLight: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderColor: 'rgba(14,143,161,0.18)',
    shadowColor: '#0A2534',
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  iconFill: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconFillMuted: {
    opacity: 0.86,
  },
  iconFillActive: {
    shadowColor: '#FB7185',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
});

export default QuestionExportControls;
