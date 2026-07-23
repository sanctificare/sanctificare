import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sanctificare.app',
  appName: 'Sanctificare',
  webDir: 'dist/public',
  backgroundColor: '#0c1327',
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
      autoUpdate: false,
    },
  },
};

export default config;
