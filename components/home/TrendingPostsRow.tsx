import React from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { PostLikeIcon } from '../icons/AppShellIcons';
import { styles } from './homeStyles';
import { SpotlightPost } from './homeTypes';
import { buildAvatarInitials } from './homeUtils';

type TrendingPostsRowProps = {
  posts: SpotlightPost[];
  isLoading: boolean;
  onOpenPost: (post: SpotlightPost) => void;
};

const TrendingPostsRow = ({ posts, isLoading, onOpenPost }: TrendingPostsRowProps) => (
  <>
    <View style={styles.topUtilityRow}>
      <View style={styles.topUtilityCopy}>
        <Text style={styles.topUtilityEyebrow}>Trending Insights</Text>
        <Text style={styles.topUtilitySubtext}>
          Explore valuable insights and knowledge shared by educators and learners.
        </Text>
      </View>
    </View>

    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.spotlightCircleRow}
    >
      {isLoading ? (
        <View style={styles.spotlightLoadingCircle}>
          <ActivityIndicator color="#F8FBFF" size="small" />
        </View>
      ) : posts.length ? (
        posts.map((post, index) => (
          <TouchableOpacity
            key={post.id}
            activeOpacity={0.9}
            onPress={() => onOpenPost(post)}
            style={[styles.spotlightTouch, index === 0 ? styles.spotlightTouchFeatured : null]}
          >
            <View style={[styles.spotlightRingShell, index === 0 ? styles.spotlightRingShellFeatured : null]}>
              <LinearGradient
                colors={
                  index === 0
                    ? ['#FFF3B0', '#FACC15', '#F59E0B', '#B45309']
                    : ['#FB923C', '#FACC15', '#38BDF8', '#14B8A6']
                }
                end={{ x: 1, y: 1 }}
                start={{ x: 0, y: 0 }}
                style={[styles.spotlightRing, index === 0 ? styles.spotlightRingFeatured : null]}
              />

              {index === 0 ? <View pointerEvents="none" style={styles.spotlightWinnerHalo} /> : null}

              <View style={[styles.spotlightInnerRing, index === 0 ? styles.spotlightInnerRingFeatured : null]}>
                <Text style={[styles.spotlightInitials, index === 0 ? styles.spotlightInitialsFeatured : null]}>
                  {buildAvatarInitials(post.authorName)}
                </Text>
                <View style={[styles.spotlightLikeBadge, index === 0 ? styles.spotlightLikeBadgeFeatured : null]}>
                  <PostLikeIcon color="#FFF7FB" filled size={12} />
                  <Text style={styles.spotlightLikeBadgeText}>{post.likeCount}</Text>
                </View>
              </View>
            </View>
            <Text numberOfLines={1} style={[styles.spotlightLabel, index === 0 ? styles.spotlightLabelFeatured : null]}>
              {index === 0 ? 'Most Liked'  : post.authorName}
            </Text>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.spotlightEmptyState}>
          <Text style={styles.spotlightEmptyTitle}>No posts yet</Text>
          <Text style={styles.spotlightEmptyText}>
            Posts will appear here after learners publish them.
          </Text>
        </View>
      )}
    </ScrollView>
  </>
);

export default TrendingPostsRow;
