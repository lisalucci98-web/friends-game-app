import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lisalucci.fantamotogp',
  appName: 'FantaMotoGP',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
  },
};

export default config;
