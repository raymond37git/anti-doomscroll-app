import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d322d0933abe42dd86605be7cb2492da',
  appName: 'FocusTime - Social Media Limiter',
  webDir: 'dist',
  server: {
    url: "https://d322d093-3abe-42dd-8660-5be7cb2492da.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1e293b",
      showSpinner: false,
    },
  },
};

export default config;