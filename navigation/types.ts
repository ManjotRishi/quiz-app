export type RootStackParamList = {
  Splash: undefined;
  QuizBoard: undefined;
  Score: {
    totalQuestions: number;
    correctAnswers: number;
    timeTakenSeconds: number;
    accuracy: number;
  };
};
