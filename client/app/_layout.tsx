import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import RNUxcam from 'react-native-ux-cam';

import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    const uxcam_api_key = process.env.EXPO_PUBLIC_UXCAM_API_KEY;

    if (uxcam_api_key) {
      RNUxcam.optIntoSchematicRecordings(); // enable ios screen recordings

      const configuration = {
        userAppKey: uxcam_api_key,
        enableAutomaticScreenNameTagging: true,
        enableAdvancedGestureRecognition: true,
        enableImprovedScreenCapture: true,
        disableAutoRecord: true,
      };

      RNUxcam.startWithConfiguration(configuration);
    } else {
      console.warn('api key for UXCam undefined');
    }
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
