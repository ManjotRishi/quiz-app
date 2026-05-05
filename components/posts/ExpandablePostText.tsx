import React, { useLayoutEffect, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextLayoutEventData,
  TextStyle,
  View,
} from 'react-native';
import { CurvedArrowDownIcon, CurvedArrowUpIcon } from '../icons/AppShellIcons';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type ExpandablePostTextProps = {
  collapsedLines?: number;
  text: string;
  textStyle?: StyleProp<TextStyle>;
  toggleStyle?: StyleProp<TextStyle>;
};

const COLLAPSED_SUFFIX_LABEL = 'show more';
const EXPANDED_SUFFIX_LABEL = 'show less';
const COLLAPSED_SUFFIX_RESERVE = 12;
const EXPAND_EASING = Easing.bezier(0.22, 1, 0.36, 1);
const EXPAND_DURATION_MS = 820;

const buildCollapsedPreview = (
  lines: TextLayoutEventData['lines'],
  collapsedLines: number
) => {
  const previewLines = lines.slice(0, collapsedLines).map((line) => line.text.trim());

  if (!previewLines.length) {
    return '';
  }

  const lastLineIndex = previewLines.length - 1;
  const trimmedLastLine = previewLines[lastLineIndex]
    .replace(/[.,;:!?-]+$/g, '')
    .trim();

  previewLines[lastLineIndex] =
    trimmedLastLine.length > COLLAPSED_SUFFIX_RESERVE
      ? trimmedLastLine
          .slice(0, trimmedLastLine.length - COLLAPSED_SUFFIX_RESERVE)
          .replace(/[.,;:!?-]+$/g, '')
          .trim()
      : trimmedLastLine;

  return previewLines.join(' ').trim();
};

const ExpandablePostText = ({
  collapsedLines = 2,
  text,
  textStyle,
  toggleStyle,
}: ExpandablePostTextProps) => {
  const hasMeasuredLinesRef = useRef(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExpandable, setIsExpandable] = useState(false);
  const [collapsedPreview, setCollapsedPreview] = useState(text.trim());
  const [collapsedHeight, setCollapsedHeight] = useState(0);
  const [expandedHeight, setExpandedHeight] = useState(0);
  const progress = useSharedValue(0);

  useLayoutEffect(() => {
    hasMeasuredLinesRef.current = false;
    setIsExpanded(false);
    setIsExpandable(false);
    setCollapsedPreview(text.trim());
    setCollapsedHeight(0);
    setExpandedHeight(0);
    progress.value = 0;
  }, [progress, text]);

  const handleFullTextLayout = (event: { nativeEvent: TextLayoutEventData }) => {
    if (hasMeasuredLinesRef.current) {
      return;
    }

    const { lines } = event.nativeEvent;
    const nextIsExpandable = lines.length > collapsedLines;

    setIsExpandable(nextIsExpandable);
    setCollapsedPreview(
      nextIsExpandable ? buildCollapsedPreview(lines, collapsedLines) : text.trim()
    );
    hasMeasuredLinesRef.current = true;
  };

  const handleCollapsedLayout = (event: LayoutChangeEvent) => {
    const nextHeight = Math.ceil(event.nativeEvent.layout.height);

    if (nextHeight && nextHeight !== collapsedHeight) {
      setCollapsedHeight(nextHeight);
    }
  };

  const handleExpandedLayout = (event: LayoutChangeEvent) => {
    const nextHeight = Math.ceil(event.nativeEvent.layout.height);

    if (nextHeight && nextHeight !== expandedHeight) {
      setExpandedHeight(nextHeight);
    }
  };

  const handleToggle = () => {
    if (!isExpandable) {
      return;
    }

    const nextExpanded = !isExpanded;
    setIsExpanded(nextExpanded);
    progress.value = withTiming(nextExpanded ? 1 : 0, {
      duration: EXPAND_DURATION_MS,
      easing: EXPAND_EASING,
    });
  };

  const wrapperStyle = useAnimatedStyle(() => {
    const safeCollapsedHeight = collapsedHeight || expandedHeight;
    const safeExpandedHeight = expandedHeight || collapsedHeight;

    return {
      height:
        safeCollapsedHeight && safeExpandedHeight
          ? interpolate(progress.value, [0, 1], [safeCollapsedHeight, safeExpandedHeight])
          : undefined,
    };
  });

  const collapsedLayerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.45, 1], [1, 0.2, 0]),
    transform: [
      {
        translateY: interpolate(progress.value, [0, 1], [0, -4]),
      },
    ],
  }));

  const expandedLayerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.3, 1], [0, 0.08, 1]),
    transform: [
      {
        translateY: interpolate(progress.value, [0, 1], [6, 0]),
      },
    ],
  }));

  return (
    <View style={styles.container}>
      <View pointerEvents="none" style={styles.measureWrap}>
        <Text onTextLayout={handleFullTextLayout} style={textStyle}>
          {text.trim()}
        </Text>
      </View>

      {isExpandable ? (
        <View pointerEvents="none" style={styles.measureWrap}>
          <View onLayout={handleCollapsedLayout} style={styles.contentBlock}>
            <Text numberOfLines={collapsedLines} style={textStyle}>
              {collapsedPreview}
            </Text>
            <View style={styles.toggleRow}>
              <CurvedArrowDownIcon color="#FDBA74" size={14} />
              <Text style={toggleStyle}>{COLLAPSED_SUFFIX_LABEL}</Text>
            </View>
          </View>
        </View>
      ) : null}

      <View pointerEvents="none" style={styles.measureWrap}>
        <View onLayout={handleExpandedLayout} style={styles.contentBlock}>
          <Text style={textStyle}>{text.trim()}</Text>
          {isExpandable ? (
            <View style={styles.toggleRow}>
              <CurvedArrowUpIcon color="#FDBA74" size={14} />
              <Text style={toggleStyle}>{EXPANDED_SUFFIX_LABEL}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {!isExpandable ? (
        <Text style={textStyle}>{text.trim()}</Text>
      ) : (
        <Animated.View style={[styles.animatedWrap, wrapperStyle]}>
          <Animated.View
            pointerEvents={isExpanded ? 'none' : 'auto'}
            style={[styles.layer, collapsedLayerStyle]}
          >
            <View style={styles.contentBlock}>
              <Text numberOfLines={collapsedLines} style={textStyle}>
                {collapsedPreview}
              </Text>
              <Pressable hitSlop={8} onPress={handleToggle} style={styles.toggleRow}>
                <CurvedArrowDownIcon color="#FDBA74" size={14} />
                <Text style={toggleStyle}>{COLLAPSED_SUFFIX_LABEL}</Text>
              </Pressable>
            </View>
          </Animated.View>

          <Animated.View
            pointerEvents={isExpanded ? 'auto' : 'none'}
            style={[styles.layer, styles.expandedLayer, expandedLayerStyle]}
          >
            <View style={styles.contentBlock}>
              <Text style={textStyle}>{text.trim()}</Text>
              <Pressable hitSlop={8} onPress={handleToggle} style={styles.toggleRow}>
                <CurvedArrowUpIcon color="#FDBA74" size={14} />
                <Text style={toggleStyle}>{EXPANDED_SUFFIX_LABEL}</Text>
              </Pressable>
            </View>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  animatedWrap: {
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  contentBlock: {
    width: '100%',
  },
  container: {
    width: '100%',
  },
  expandedLayer: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  layer: {
    width: '100%',
  },
  measureWrap: {
    left: 0,
    opacity: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    width: '100%',
    zIndex: -1,
  },
  toggleRow: {
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
    flexDirection: 'row',
    gap: 4,
    marginLeft: 50,
    marginTop: 6,
  },
});

export default ExpandablePostText;
