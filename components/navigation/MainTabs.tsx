import React from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Home from '../../pages/Home';
import BookmarksScreen from '../../pages/BookmarksScreen';
import ProfileScreen from '../../pages/ProfileScreen';
import PostsScreen from '../../pages/PostsScreen';
import TestsScreen from '../../pages/TestsScreen';
import { fontScale, isCompactScreen, radiusScale, spaceScale } from '../../style/responsive';
import { getMainTabBarMetrics } from '../../util/tabBarLayout';
import {
  TabBookmarkIcon,
  TabHomeIcon,
  TabPostsIcon,
  TabProfileIcon,
  TabTestsIcon,
} from '../icons/AppShellIcons';

type MainTabParamList = {
  HomeTab: undefined;
  TestsTab: undefined;
  PostsTab: undefined;
  BookmarksTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_META = {
  HomeTab: { label: 'Home', Icon: TabHomeIcon },
  TestsTab: { label: 'Tests', Icon: TabTestsIcon },
  PostsTab: { label: 'Posts', Icon: TabPostsIcon },
  BookmarksTab: { label: 'Saved', Icon: TabBookmarkIcon },
  ProfileTab: { label: 'Profile', Icon: TabProfileIcon },
} as const;

const AppTabIcon = ({
  routeName,
  focused,
}: {
  routeName: keyof typeof TAB_META;
  focused: boolean;
}) => {
  const { width } = useWindowDimensions();
  const tab = TAB_META[routeName];
  const metrics = getMainTabBarMetrics(width, 0);
  const color = focused ? '#F8FBFF' : 'rgba(218,234,242,0.68)';
  const compact = width < 370 || isCompactScreen;

  return (
    <View style={[styles.tabItem, { gap: metrics.tabGap }]}>
      <View style={[styles.iconWrap, focused ? styles.iconWrapActive : null]}>
        {focused ? (
          <LinearGradient
            colors={['#14B8A6', '#38BDF8', '#FB923C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.iconGradient,
              {
                width: metrics.iconBoxSize,
                height: metrics.iconBoxSize,
                borderRadius: radiusScale(compact ? 12 : 14),
              },
            ]}
          >
            <tab.Icon color={color} size={metrics.iconSize} />
          </LinearGradient>
        ) : (
          <View
            style={[
              styles.iconIdle,
              {
                width: metrics.iconBoxSize,
                height: metrics.iconBoxSize,
                borderRadius: radiusScale(compact ? 12 : 14),
              },
            ]}
          >
            <tab.Icon color={color} size={metrics.iconSize} />
          </View>
        )}
      </View>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
        style={[
          styles.tabLabel,
          {
            fontSize: fontScale(metrics.labelFontSize),
            opacity: focused ? 1 : 0.8,
          },
          focused ? styles.tabLabelActive : null,
        ]}
      >
        {tab.label}
      </Text>
    </View>
  );
};

const MainTabs = () => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const metrics = getMainTabBarMetrics(width, insets.bottom);

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: [
          styles.tabBar,
          {
            bottom: metrics.bottomOffset,
            left: metrics.horizontalInset,
            right: metrics.horizontalInset,
            height: metrics.barHeight,
            borderRadius: metrics.barRadius,
            paddingTop: 0,
            paddingBottom: 0,
          },
        ],
        tabBarItemStyle: [
          styles.tabBarItem,
          {
            height: '100%',
            paddingHorizontal: width < 360 ? 0 : spaceScale(1),
          },
        ],
        tabBarIconStyle: styles.tabBarIconSlot,
        tabBarIcon: ({ focused }) => (
          <AppTabIcon routeName={route.name as keyof typeof TAB_META} focused={focused} />
        ),
      })}
    >
      <Tab.Screen name="HomeTab" component={Home} />
      <Tab.Screen name="TestsTab" component={TestsScreen} />
      <Tab.Screen name="PostsTab" component={PostsScreen} />
      <Tab.Screen name="BookmarksTab" component={BookmarksScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: spaceScale(12),
    left: spaceScale(10),
    right: spaceScale(10),
    height: spaceScale(82),
    paddingTop: spaceScale(10),
    paddingBottom: spaceScale(10),
    borderRadius: radiusScale(26),
    backgroundColor: 'rgba(8, 24, 35, 0.96)',
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#04131D',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 16,
  },
  tabBarItem: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
    paddingHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarIconSlot: {
    flex: 1,
    width: '100%',
    height: '100%',
    marginTop: 0,
    marginBottom: 0,
    alignSelf: 'center',
  },
  tabItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingTop: 0,
  },
  iconWrap: {
    borderRadius: radiusScale(16),
    overflow: 'hidden',
  },
  iconWrapActive: {
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  iconGradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconIdle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  tabLabel: {
    maxWidth: '100%',
    color: 'rgba(218,234,242,0.6)',
    fontWeight: '800',
    textAlign: 'center',
    includeFontPadding: false,
  },
  tabLabelActive: {
    color: '#F8FBFF',
  },
});

export default MainTabs;
