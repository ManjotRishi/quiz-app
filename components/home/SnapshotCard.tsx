import React from 'react';
import { Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { styles } from './homeStyles';
import { ProgressCardItem, TopicSummaryItem } from './homeTypes';

type SnapshotCardProps = {
  progressCards: ProgressCardItem[];
  topics: TopicSummaryItem[];
};

const SnapshotCard = ({ progressCards, topics }: SnapshotCardProps) => (
  <View style={styles.snapshotCard}>
    <Text style={styles.snapshotTitle}>Today&apos;s Snapshot</Text>
    <View style={styles.snapshotGrid}>
      {progressCards.map((item) => (
        <View key={item.label} style={styles.snapshotItem}>
          <Text style={styles.snapshotValue}>{item.value}</Text>
          <Text style={styles.snapshotLabel}>{item.label}</Text>
        </View>
      ))}
    </View>

    <View style={styles.progressList}>
      {topics.map((topic) => (
        <View key={topic.key} style={styles.progressRow}>
          <View style={styles.progressRowTop}>
            <Text style={styles.progressName}>{topic.title}</Text>
            <Text style={styles.progressPercent}>{topic.accuracy}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={[topic.accent, '#F8FBFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${Math.max(10, topic.accuracy)}%` }]}
            />
          </View>
        </View>
      ))}
    </View>
  </View>
);

export default SnapshotCard;
