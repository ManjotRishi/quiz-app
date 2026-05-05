import { CommonActions, NavigationProp, ParamListBase } from '@react-navigation/native';
import { ROUTES } from '../navigation/routes';
import { RootStackParamList } from '../navigation/types';

type RouteName = keyof RootStackParamList;

type NavigateToRouteOptions<T extends RouteName> = {
  name: T;
  params?: RootStackParamList[T];
};

export const resetToHomeScreen = <T extends RouteName>(
  navigation: NavigationProp<ParamListBase>,
  { name, params }: NavigateToRouteOptions<T>
) => {
  if (name === ROUTES.Home) {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: ROUTES.Home }],
      })
    );
    return;
  }

  navigation.dispatch(
    CommonActions.reset({
      index: 1,
      routes: [
        { name: ROUTES.Home },
        params === undefined ? { name } : { name, params },
      ],
    })
  );
};
