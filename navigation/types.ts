import { ROUTES } from './routes';

export type RootStackParamList = {
  [ROUTES.Splash]: undefined;
  [ROUTES.Home]: undefined;
  [ROUTES.QuizBoard]: undefined;
  [ROUTES.EnglishQuizz]: undefined;
  [ROUTES.ChildQuizz]: undefined;
  [ROUTES.GkBoard]: undefined;
  [ROUTES.TrickeyQuestions]: undefined;
  [ROUTES.More]: undefined;
  [ROUTES.Score]: {
    quizType: 'quizzes' | 'puzzles' | 'gk' | 'ca' | 'tc' | 'currentAffairs' | 'english' | 'child';
    quizLabel?: 'GK' | 'CA' | 'Puzzles' | 'English Quizz' | 'Child Quizz';
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    notAttemptedAnswers: number;
    timeTakenSeconds: number;
    accuracy: number;
  };
};
