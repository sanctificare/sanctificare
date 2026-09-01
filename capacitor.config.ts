import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sanctificare.app',
  appName: 'Sanctificare',
  webDir: 'dist/public',
  backgroundColor: '#faf7f2',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    CapacitorUpdater: {
      autoUpdate: 'off',
      resetWhenUpdate: true,
    },
  },
};

export default config;
