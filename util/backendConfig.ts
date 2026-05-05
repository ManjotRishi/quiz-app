import { Platform } from 'react-native';

// Set this once to your deployed Vercel backend URL.
// Example: 'https://your-project.vercel.app'
export const DEPLOYED_BACKEND_BASE_URL = 'https://backend-tau-ochre-53.vercel.app';

// Optional override for real-device local testing.
// Example: 'http://192.168.1.8:3000'
export const CUSTOM_LOCAL_BACKEND_BASE_URL = '';

export const LOCAL_BACKEND_BASE_URLS = Platform.select({
  android: ['http://10.0.2.2:3000'],
  ios: ['http://127.0.0.1:3000', 'http://localhost:3000'],
  default: ['http://127.0.0.1:3000'],
}) ?? ['http://127.0.0.1:3000'];

export const BACKEND_REQUEST_TIMEOUT_MS = 65000;
