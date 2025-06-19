import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.maatpeasant.app',
  appName: 'MAAT App',
  webDir: 'www',
  cordova: {
    preferences: {
      ScrollEnabled: 'false',
      'android-minSdkVersion': '19',
      BackupWebStorage: 'none'
    }
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 5000,
      launchFadeOutDuration: 5000,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: false
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    CapacitorHttp: {
      enabled: true
    },
    StatusBar: {
      overlaysWebView: false,
      style: "LIGHT",
      backgroundColor: "#ebebe0"
    },
    EdgeToEdge: {
      "backgroundColor": "#ebebe0"
    }
  },
  android: {
    allowMixedContent: true,
    adjustMarginsForEdgeToEdge: 'force'
  },
  server: {
    androidScheme: 'http',
    cleartext: true,
  },
};

export default config;
