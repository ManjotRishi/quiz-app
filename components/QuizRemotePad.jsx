import React from 'react';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const RemoteButton = ({ label, onPress, children, size = 42, active = true }) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    disabled={!active}
    style={[styles.buttonHit, { width: size, height: size }]}
  >
    <LinearGradient
      colors={['rgba(139,92,246,0.98)', 'rgba(37,99,235,0.96)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.button, { width: size, height: size, borderRadius: size / 2 }]}
    >
      {children ?? <Text style={styles.fallbackText}>{label}</Text>}
    </LinearGradient>
  </TouchableOpacity>
);

const NextButton = ({ label, onPress, width = 78, compact = false }) => (
  <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.actionHit}>
    <LinearGradient
      colors={['#8B5CF6', '#60A5FA', '#2B115A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.nextButton, { minWidth: width }]}
    >
      <Text style={[styles.nextText, compact && styles.nextTextCompact]}>{label}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const TutorialButton = ({ label, onPress, width = 124, compact = false }) => (
  <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.actionHit}>
    <LinearGradient
      colors={['rgba(17,24,39,0.96)', 'rgba(59,130,246,0.90)', 'rgba(168,85,247,0.84)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.tutorialButton, { minWidth: width }]}
    >
      <Text style={[styles.tutorialText, compact && styles.tutorialTextCompact]}>{label}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const QuizRemotePad = ({
  top,
  left,
  right,
  bottom,
  center,
  next,
  extra,
  bottomAction,
  singleRow = false,
}) => {
  const { width } = useWindowDimensions();
  const compact = width < 380;
  const buttonSize = compact ? 36 : 40;
  const singleRowButtonSize = compact ? 30 : 34;
  const nextWidth = compact ? 64 : 72;
  const hasActions = Boolean(next || bottomAction);
  const primaryButtons = [left, top, center].filter(Boolean);
  const secondaryButtons = [right, bottom].filter(Boolean);
  const iconButtons = [left, top, center, right, bottom, extra].filter(Boolean);

  return (
    <View
      style={[
        styles.pad,
        singleRow && styles.padSingleRow,
        {
          paddingHorizontal: compact ? 9 : 10,
          paddingVertical: compact ? 9 : 10,
        },
      ]}
    >
      <View pointerEvents="none" style={styles.glowOne} />
      <View pointerEvents="none" style={styles.glowTwo} />

      <View style={styles.gridRow}>
        <View style={[styles.controlsColumn, singleRow && styles.controlsColumnSingleRow]}>
          {singleRow ? (
            <View style={styles.singleRowRow}>
              {iconButtons.map((button, index) => (
                <View key={`icon-${index}`} style={styles.singleRowItemWrap}>
                  <RemoteButton {...button} size={singleRowButtonSize} />
                </View>
              ))}
            </View>
          ) : (
            <>
              <View style={styles.buttonRow}>
                {primaryButtons.map((button, index) => (
                  <RemoteButton key={`primary-${index}`} {...button} size={buttonSize} />
                ))}
              </View>

              {secondaryButtons.length || extra ? (
                <View style={styles.buttonRow}>
                  {secondaryButtons.map((button, index) => (
                    <RemoteButton key={`secondary-${index}`} {...button} size={buttonSize} />
                  ))}
                  {extra ? (
                    <View style={styles.voiceLiftWrap}>
                      <RemoteButton {...extra} size={buttonSize} />
                    </View>
                  ) : null}
                </View>
              ) : null}
            </>
          )}
        </View>

        {hasActions ? (
          <View style={[styles.actionsColumn, { width: compact ? 108 : 124 }]}>
            {next ? <NextButton {...next} width={nextWidth} compact={compact} /> : null}
            {bottomAction ? (
              <TutorialButton {...bottomAction} width={compact ? 108 : 124} compact={compact} />
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
};

export default QuizRemotePad;

const styles = StyleSheet.create({
  pad: {
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(8,11,22,0.82)',
    shadowColor: '#0A102E',
    shadowOpacity: 0.34,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
    overflow: 'hidden',
  },
  padSingleRow: {
    overflow: 'hidden',
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  controlsColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  controlsColumnSingleRow: {
    alignItems: 'center',
    paddingRight: 0,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'nowrap',
  },
  singleRowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    gap: 8,
    minWidth: 0,
    width: '100%',
  },
  singleRowItemWrap: {
    flexShrink: 0,
  },
  voiceLiftWrap: {
    marginTop: -50,
  },
  actionsColumn: {
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    gap: 10,
    flexShrink: 0,
  },
  glowOne: {
    position: 'absolute',
    left: -20,
    top: -22,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(139,92,246,0.12)',
  },
  glowTwo: {
    position: 'absolute',
    right: -10,
    bottom: -24,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(96,165,250,0.10)',
  },
  buttonHit: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  actionHit: {
    height: 42,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    height: 42,
    borderRadius: 21,
    width: '100%',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  nextText: {
    color: '#F8F4FF',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.2,
  },
  nextTextCompact: {
    fontSize: 12,
  },
  tutorialButton: {
    height: 42,
    width: '100%',
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4D8CFF',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  tutorialText: {
    color: '#F4F7FF',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.2,
  },
  tutorialTextCompact: {
    fontSize: 11,
  },
  fallbackText: {
    color: '#F4F7FF',
    fontWeight: '800',
    fontSize: 13,
  },
});
