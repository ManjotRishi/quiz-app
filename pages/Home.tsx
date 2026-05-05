import React, { useMemo } from 'react';
import { ScrollView, StatusBar, View, useWindowDimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import LearnerNameModal from '../components/LearnerNameModal';
import TopBanner from '../components/TopBanner';
import HeroCard from '../components/home/HeroCard';
import KidsCornerCard from '../components/home/KidsCornerCard';
import PostPreviewModal from '../components/home/PostPreviewModal';
import QuickActionsSection from '../components/home/QuickActionsSection';
import SnapshotCard from '../components/home/SnapshotCard';
import TopicsSection from '../components/home/TopicsSection';
import TrendingPostsRow from '../components/home/TrendingPostsRow';
import { getExploreTopics, getProgressCards, getQuickActions } from '../components/home/homeContent';
import { styles } from '../components/home/homeStyles';
import { TopicSummaryItem } from '../components/home/homeTypes';
import { getHomeQuickGridMetrics } from '../components/home/homeUtils';
import { useHomePosts } from '../components/home/useHomePosts';
import { ROUTES } from '../navigation/routes';
import { useAppStore } from '../store/useAppStore';
import { getOverallQuizStats, getTopicStatsSummary } from '../util/quizStats';

const Home = ({ navigation }: { navigation: any }) => {
  const { width } = useWindowDimensions();
  const quickGrid = useMemo(() => getHomeQuickGridMetrics(width), [width]);
  const overall = useMemo(() => getOverallQuizStats(), []);
  const topics = useMemo(() => getTopicStatsSummary() as TopicSummaryItem[], []);
  const quickActions = useMemo(() => getQuickActions(), []);
  const exploreTopics = useMemo(() => getExploreTopics(topics), [topics]);
  const progressCards = useMemo(() => getProgressCards(overall), [overall]);
  const accuracy = overall.attempted ? Math.round((overall.correct / overall.attempted) * 100) : 72;
  const learnerName = useAppStore((state) => state.learnerName);
  const setLearnerName = useAppStore((state) => state.setLearnerName);
  const displayName = learnerName?.trim() || 'Learner';
  const topicCardWidth = Math.max(118, Math.min(144, width * 0.34));
  const {
    homePosts,
    isHomePostsLoading,
    selectedHomePost,
    openSpotlightModal,
    closeSpotlightModal,
    clearSelectedHomePost,
  } = useHomePosts();

  const handleOpenPostsTab = () => {
    clearSelectedHomePost();
    navigation.navigate('PostsTab');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#061722', '#0C2331', '#133547', '#17465C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />
        <View style={styles.glowAccent} />
        <TopBanner />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingHorizontal: quickGrid.contentPadding }]}
        >
          <TrendingPostsRow
            posts={homePosts}
            isLoading={isHomePostsLoading}
            onOpenPost={openSpotlightModal}
          />

          <HeroCard
            accuracy={accuracy}
            correctCount={overall.correct || 0}
            displayName={displayName}
            englishAttempted={topics.find((item) => item.key === 'english')?.attempted ?? 0}
            tracksCount={topics.length}
            onContinue={() => navigation.navigate(ROUTES.EnglishQuizz)}
          />

          <QuickActionsSection
            actions={quickActions}
            quickGrid={quickGrid}
            onNavigate={(route) => navigation.navigate(route)}
          />

          <TopicsSection
            topics={exploreTopics}
            topicCardWidth={topicCardWidth}
            onNavigate={(route) => navigation.navigate(route)}
            onViewAll={() => navigation.navigate('TestsTab')}
          />

          <KidsCornerCard onOpen={() => navigation.navigate(ROUTES.ChildSection)} />

          <SnapshotCard progressCards={progressCards} topics={topics} />
        </ScrollView>

        <LearnerNameModal
          visible={!learnerName?.trim()}
          initialValue={learnerName}
          onSubmit={setLearnerName}
        />

        <PostPreviewModal
          post={selectedHomePost}
          visible={Boolean(selectedHomePost)}
          onClose={closeSpotlightModal}
          onOpenFeed={handleOpenPostsTab}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

export default Home;
