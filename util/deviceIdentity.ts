import { createMMKV } from 'react-native-mmkv';
import DeviceInfo from 'react-native-device-info';

const FALLBACK_DEVICE_KEY = 'unknown_device';
const STORAGE_ID = 'dailyQuizz.deviceIdentity';
const INSTALLATION_KEY = 'installation_scope_key';
const INVALID_DEVICE_KEYS = new Set([
  '',
  'unknown',
  'unknown_device',
  'android',
  'ios',
  '00000000-0000-0000-0000-000000000000',
  '9774d56d682e549c',
]);

const sanitizeDeviceKey = (value?: string) => {
  const sanitized = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  return sanitized || FALLBACK_DEVICE_KEY;
};

const createFallbackStorage = () => {
  let memory: Record<string, string> = {};

  return {
    getString: (key: string) =>
      Object.prototype.hasOwnProperty.call(memory, key) ? memory[key] : undefined,
    set: (key: string, value: string) => {
      memory[key] = value;
    },
  };
};

const getStorage = () => {
  try {
    return createMMKV({
      id: STORAGE_ID,
    });
  } catch (error) {
    console.warn('MMKV unavailable, falling back to in-memory device identity storage:', error);
    return createFallbackStorage();
  }
};

const STORAGE = getStorage();

const generateInstallationKey = () =>
  sanitizeDeviceKey(
    `install_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`
  );

const readOrCreateInstallationKey = () => {
  const existingKey = sanitizeDeviceKey(STORAGE.getString(INSTALLATION_KEY));

  if (!INVALID_DEVICE_KEYS.has(existingKey)) {
    return existingKey;
  }

  const nextKey = generateInstallationKey();
  STORAGE.set(INSTALLATION_KEY, nextKey);
  return nextKey;
};

const getStableScopedKey = () => {
  try {
    const nativeUniqueId = sanitizeDeviceKey(DeviceInfo.getUniqueIdSync?.());

    if (!INVALID_DEVICE_KEYS.has(nativeUniqueId)) {
      return nativeUniqueId;
    }
  } catch (error) {
    console.warn('Failed to read device unique id, using installation scope:', error);
  }

  return readOrCreateInstallationKey();
};

let cachedDeviceScopeKey: string | null = null;

export const getDeviceScopeKey = () => {
  if (cachedDeviceScopeKey) {
    return cachedDeviceScopeKey;
  }

  cachedDeviceScopeKey = getStableScopedKey();

  return cachedDeviceScopeKey;
};
