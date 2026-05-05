import React from 'react';
import { ImageBackground, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ChildTopicIcon } from '../icons';
import { colors } from '../../style/colors';
import { styles } from './homeStyles';

type KidsCornerCardProps = {
  onOpen: () => void;
};

const KidsCornerCard = ({ onOpen }: KidsCornerCardProps) => (
  <TouchableOpacity activeOpacity={0.92} onPress={onOpen} style={styles.storyTouch}>
    <ImageBackground
      source={require('../../assets/images/child_quizz.png')}
      resizeMode="stretch"
      imageStyle={styles.storyCardImage}
      style={styles.storyCard}
    >
      <LinearGradient
        colors={['rgba(7,23,34,0.14)', 'rgba(7,23,34,0.56)', 'rgba(7,23,34,0.88)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.storyCardOverlay}
      />
      <View style={styles.storyGlowPrimary} />
      <View style={styles.storyGlowSecondary} />
      <View style={styles.storySparkleOne} />
      <View style={styles.storySparkleTwo} />

      <View style={styles.storyContentColumn}>
        <View style={styles.storyTitleRow}>
          <ChildTopicIcon color={colors.accentGold} size={20} />
          <Text style={styles.storyTitleText}>Kids Corner</Text>
        </View>

        <View style={styles.storyCopyWrap}>
          <View style={styles.storyTagRow}>
            <View style={[styles.storyTag, styles.storyTagBlue]}>
              <Text style={styles.storyTagText}>Story</Text>
            </View>
            <View style={[styles.storyTag, styles.storyTagMint]}>
              <Text style={styles.storyTagText}>Quiz</Text>
            </View>
          </View>

          <View style={styles.storyCtaWrap}>
            <Text style={styles.storyCtaText}>Open Fun Zone</Text>
          </View>
        </View>
      </View>
    </ImageBackground>
  </TouchableOpacity>
);

export default KidsCornerCard;
