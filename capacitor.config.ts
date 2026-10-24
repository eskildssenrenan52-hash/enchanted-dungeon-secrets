import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.renan.golden.arrow.odyssey",
  appName: "Golden Arrow Odyssey",
  webDir: "dist/client",
  backgroundColor: "#000000",
  android: {
    allowMixedContent: false,
    backgroundColor: "#000000",
  },
  plugins: {
    SplashScreen: { launchShowDuration: 0, backgroundColor: "#000000" },
    StatusBar: { style: "DARK", backgroundColor: "#000000", overlaysWebView: true },
  },
};

export default config;
