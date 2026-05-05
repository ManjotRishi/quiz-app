import {
  ChildTopicIcon,
  CurrentAffairsTopicIcon,
  EnglishTopicIcon,
  GkTopicIcon,
  MathTopicIcon,
  PuzzleTopicIcon,
} from '../icons';
import { ROUTES } from '../../navigation/routes';
import {
  HomeQuickAction,
  HomeTopicItem,
  ProgressCardItem,
  TopicSummaryItem,
} from './homeTypes';

export const getQuickActions = (): HomeQuickAction[] => [
  {
    key: 'daily',
    title: 'Daily Sprint',
    subtitle: 'Fresh GK set',
    accent: '#14B8A6',
    colors: ['#14B8A6', '#38BDF8'],
    image: require('../../assets/images/gk_drill.png'),
    glow: 'rgba(20,184,166,0.22)',
    route: ROUTES.QuizBoard,
    Icon: GkTopicIcon,
  },
  {
    key: 'math',
    title: 'Math Drill',
    subtitle: 'Numbers and speed',
    accent: '#5EEAD4',
    colors: ['#14B8A6', '#0EA5E9'],
    image: require('../../assets/images/math_drill.png'),
    glow: 'rgba(14,165,233,0.24)',
    route: ROUTES.MathQuizz,
    Icon: MathTopicIcon,
  },
  {
    key: 'mock',
    title: 'English Lab',
    subtitle: 'Grammar and vocab',
    accent: '#7DD3FC',
    colors: ['#0EA5E9', '#2563EB'],
    image: require('../../assets/images/english_drill.png'),
    glow: 'rgba(37,99,235,0.24)',
    route: ROUTES.EnglishQuizz,
    Icon: EnglishTopicIcon,
  },
  {
    key: 'quick',
    title: 'News Quiz',
    subtitle: 'Today in current affairs',
    accent: '#FDBA74',
    colors: ['#FB923C', '#F97316'],
    image: require('../../assets/images/current_affair.png'),
    glow: 'rgba(249,115,22,0.24)',
    route: ROUTES.GkBoard,
    Icon: CurrentAffairsTopicIcon,
  },
];

export const getExploreTopics = (topics: TopicSummaryItem[]): HomeTopicItem[] => [
  {
    key: 'gk',
    label: 'GK',
    meta: `${topics.find((item) => item.key === 'gk')?.totalQuestions ?? 0} Qs`,
    kicker: 'Starter',
    accent: '#14B8A6',
    colors: ['#14B8A6', '#2DD4BF'],
    image: require('../../assets/images/gk_next.png'),
    route: ROUTES.QuizBoard,
    Icon: GkTopicIcon,
  },
  {
    key: 'math',
    label: 'Math',
    meta: `${topics.find((item) => item.key === 'math')?.totalQuestions ?? 0} Qs`,
    kicker: 'Sharp',
    accent: '#14B8A6',
    colors: ['#0EA5E9', '#14B8A6'],
    image: require('../../assets/images/math_next.png'),
    route: ROUTES.MathQuizz,
    Icon: MathTopicIcon,
  },
  {
    key: 'english',
    label: 'English',
    meta: `${topics.find((item) => item.key === 'english')?.totalQuestions ?? 0} Qs`,
    kicker: 'Words',
    accent: '#38BDF8',
    colors: ['#2563EB', '#38BDF8'],
    image: require('../../assets/images/english_next.png'),
    route: ROUTES.EnglishQuizz,
    Icon: EnglishTopicIcon,
  },
  {
    key: 'ca',
    label: 'Current',
    meta: `${topics.find((item) => item.key === 'ca')?.totalQuestions ?? 0} Qs`,
    kicker: 'Daily',
    accent: '#FB923C',
    colors: ['#FB923C', '#F97316'],
    image: require('../../assets/images/current_affair.png'),
    route: ROUTES.GkBoard,
    Icon: CurrentAffairsTopicIcon,
  },
  {
    key: 'puzzle',
    label: 'Reasoning',
    meta: `${topics.find((item) => item.key === 'tc')?.totalQuestions ?? 0} Qs`,
    kicker: 'Logic',
    accent: '#F5C451',
    colors: ['#F5C451', '#FB923C'],
    image: require('../../assets/images/reasoning.png'),
    route: ROUTES.TrickeyQuestions,
    Icon: PuzzleTopicIcon,
  },
];

export const getProgressCards = (overall: {
  quizzesPlayed?: number;
  attempted?: number;
  score?: number;
}): ProgressCardItem[] => [
  { label: 'Tests Played', value: overall.quizzesPlayed || 0 },
  { label: 'Questions Solved', value: overall.attempted || 0 },
  { label: 'Score', value: overall.score || 0 },
];
