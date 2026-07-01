import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sanctificare.app',
  appName: 'Sanctificare',
  webDir: 'dist/public',
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    CapacitorUpdater: {
      autoUpdate: false,
    },
  },
};

export default config;
