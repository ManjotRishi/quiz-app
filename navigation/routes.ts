export const ROUTES = {
  Splash: 'Splash',
  Home: 'Home',
  QuizBoard: 'QuizBoard',
  EnglishQuizz: 'EnglishQuizz',
  ChildQuizz: 'ChildQuizz',
  GkBoard: 'GkBoard',
  TrickeyQuestions: 'TrickeyQuestions',
  More: 'More',
  Score: 'Score',
} as const;

export type RouteName = (typeof ROUTES)[keyof typeof ROUTES];
