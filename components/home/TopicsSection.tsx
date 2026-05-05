import React from 'react';
import { ImageBackground, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { HomeTopicItem } from './homeTypes';
import { styles } from './homeStyles';

type TopicsSectionProps = {
  topics: HomeTopicItem[];
  topicCardWidth: number;
  onNavigate: (route: string) => void;
  onViewAll: () => void;
};

const TopicsSection = ({ topics, topicCardWidth, onNavigate, onViewAll }: TopicsSectionProps) => (
  <>
    <View style={styles.topicHeader}>
      <Text style={styles.sectionTitle}>Explore Topics</Text>
      <TouchableOpacity activeOpacity={0.85} onPress={onViewAll}>
        <Text style={styles.linkText}>View all</Text>
      </TouchableOpacity>
    </View>

    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topicRow}>
      {topics.map((topic) => (
        <TouchableOpacity
          key={topic.key}
          activeOpacity={0.9}
          style={[styles.topicTouch, { width: topicCardWidth }]}
          onPress={() => onNavigate(topic.route)}
        >
          <ImageBackground
            source={topic.image}
            resizeMode="cover"
            imageStyle={styles.topicCardImage}
            style={styles.topicCard}
          >
            <LinearGradient
              colors={['rgba(4,16,24,0.03)', 'rgba(4,16,24,0.12)', 'rgba(4,16,24,0.34)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.topicCardOverlay}
            />
            <View style={styles.topicTopRow}>
              <View style={[styles.topicIconWrap, { backgroundColor: 'rgba(255,255,255,0.16)' }]}>
                <topic.Icon color="#F8FBFF" size={18} />
              </View>
              <Text numberOfLines={1} style={styles.topicKicker}>{topic.kicker}</Text>
            </View>
            <View style={styles.topicBottomRow}>
              <Text numberOfLines={1} style={styles.topicLabel}>{topic.label}</Text>
              <Text numberOfLines={1} style={styles.topicMeta}>{topic.meta}</Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </>
);

export default TopicsSection;
