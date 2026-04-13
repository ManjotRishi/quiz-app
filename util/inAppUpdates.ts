import { Alert, Platform } from 'react-native';
import SpInAppUpdates, {
  IAUInstallStatus,
  IAUUpdateKind,
  type AndroidNeedsUpdateResponse,
  type StatusUpdateEvent,
} from 'sp-react-native-in-app-updates';

const inAppUpdates = new SpInAppUpdates(__DEV__);

let hasCheckedForUpdate = false;
let isStatusListenerAttached = false;
let hasShownInstallPrompt = false;

const handleStatusUpdate = ({ status }: StatusUpdateEvent) => {
  if (status !== IAUInstallStatus.DOWNLOADED || hasShownInstallPrompt) {
    return;
  }

  hasShownInstallPrompt = true;

  Alert.alert(
    'Update ready',
    'The latest version has been downloaded. Restart the app to finish installing it.',
    [
      {
        text: 'Later',
        style: 'cancel',
      },
      {
        text: 'Restart',
        onPress: () => {
          inAppUpdates.installUpdate();
        },
      },
    ],
    { cancelable: false },
  );
};

const attachStatusListener = () => {
  if (isStatusListenerAttached) {
    return;
  }

  inAppUpdates.addStatusUpdateListener(handleStatusUpdate);
  isStatusListenerAttached = true;
};

export const detachInAppUpdateListeners = () => {
  if (!isStatusListenerAttached) {
    return;
  }

  inAppUpdates.removeStatusUpdateListener(handleStatusUpdate);
  isStatusListenerAttached = false;
};

export const checkForAppUpdate = async () => {
  if (__DEV__ || Platform.OS !== 'android' || hasCheckedForUpdate) {
    return;
  }

  hasCheckedForUpdate = true;
  attachStatusListener();

  try {
    const updateInfo =
      (await inAppUpdates.checkNeedsUpdate()) as AndroidNeedsUpdateResponse;

    if (!updateInfo.shouldUpdate) {
      return;
    }

    const updateType = updateInfo.other.isFlexibleUpdateAllowed
      ? IAUUpdateKind.FLEXIBLE
      : updateInfo.other.isImmediateUpdateAllowed
        ? IAUUpdateKind.IMMEDIATE
        : null;

    if (updateType == null) {
      return;
    }

    await inAppUpdates.startUpdate({ updateType });
  } catch (error) {
    if (__DEV__) {
      console.log('In-app update check failed:', error);
    }
  }
};

export const showDebugUpdatePreview = () => {
  Alert.alert(
    'Update available',
    'A newer app version is available on the Play Store. Update now to preview the in-app update prompt flow.',
    [
      {
        text: 'Later',
        style: 'cancel',
      },
      {
        text: 'Update',
        onPress: () => {
          Alert.alert(
            'Preview only',
            'This is a local test prompt. The real Play Store update dialog will appear after you upload builds to Google Play testing.',
          );
        },
      },
    ],
  );
};
