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
          try {
            inAppUpdates.installUpdate();
          } catch (error) {
            console.warn('Failed to install downloaded update:', error);
          }
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

  try {
    inAppUpdates.addStatusUpdateListener(handleStatusUpdate);
    isStatusListenerAttached = true;
  } catch (error) {
    console.warn('Failed to attach in-app update listener:', error);
  }
};

export const detachInAppUpdateListeners = () => {
  if (!isStatusListenerAttached) {
    return;
  }

  try {
    inAppUpdates.removeStatusUpdateListener(handleStatusUpdate);
  } catch (error) {
    console.warn('Failed to detach in-app update listener:', error);
  } finally {
    isStatusListenerAttached = false;
  }
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

    if (!updateInfo?.shouldUpdate) {
      return;
    }

    const updateType = updateInfo?.other?.isFlexibleUpdateAllowed
      ? IAUUpdateKind.FLEXIBLE
      : updateInfo?.other?.isImmediateUpdateAllowed
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
  try {
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
  } catch (error) {
    console.warn('Failed to show update preview alert:', error);
  }
};
