export const ROUTES = {
  Splash: 'Splash',
  Home: 'Home',
  QuizBoard: 'QuizBoard',
  MathQuizz: 'MathQuizz',
  EnglishQuizz: 'EnglishQuizz',
  ChildQuizz: 'ChildQuizz',
  ChildAlphabet: 'ChildAlphabet',
  ChildCounting: 'ChildCounting',
  ChildAnimals: 'ChildAnimals',
  MultiplicationTableLearning: 'MultiplicationTableLearning',
  ChildSection: 'ChildSection',
  GkBoard: 'GkBoard',
  TrickeyQuestions: 'TrickeyQuestions',
  StoryScreen: 'StoryScreen',
  More: 'More',
  Score: 'Score',
} as const;

export type RouteName = (typeof ROUTES)[keyof typeof ROUTES];
