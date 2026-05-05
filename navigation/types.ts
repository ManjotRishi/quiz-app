import { ROUTES } from './routes';

export type RootStackParamList = {
  [ROUTES.Splash]: undefined;
  [ROUTES.Home]: undefined;
  [ROUTES.QuizBoard]: undefined;
  [ROUTES.MathQuizz]: undefined;
  [ROUTES.EnglishQuizz]: undefined;
  [ROUTES.ChildQuizz]: undefined;
  [ROUTES.ChildAlphabet]: undefined;
  [ROUTES.ChildCounting]: undefined;
  [ROUTES.ChildAnimals]: undefined;
  [ROUTES.MultiplicationTableLearning]: undefined;
  [ROUTES.ChildSection]: undefined;
  [ROUTES.GkBoard]: undefined;
  [ROUTES.TrickeyQuestions]: undefined;
  [ROUTES.StoryScreen]: undefined;
  [ROUTES.More]: undefined;
  [ROUTES.Score]: {
    quizType: 'quizzes' | 'puzzles' | 'gk' | 'ca' | 'tc' | 'currentAffairs' | 'english' | 'child' | 'math';
    quizLabel?: 'GK' | 'Current Affairs' | 'Reasoning' | 'English Quiz' | 'Child Quiz' | 'Math Quiz';
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    notAttemptedAnswers: number;
    timeTakenSeconds: number;
    accuracy: number;
    fromQuizFlow?: boolean;
  };
};
