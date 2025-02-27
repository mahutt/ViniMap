import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import RNUxcam, { OcclusionType } from 'react-native-ux-cam';

import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const pathname = usePathname();

  // handling screen name changes for usability testing
  useEffect(() => {
    if (pathname) {
      let screenName = 'Unknown';

      if (pathname === '/') {
        screenName = 'HomeScreen';
      } else if (pathname.startsWith('/')) {
        screenName = pathname
          .substring(1)
          .replace(/\//g, '_')
          .replace(/[^a-zA-Z0-9_]/g, '');

        screenName = screenName
          .split('_')
          .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
          .join('_');

        if (screenName.length === 0) {
          screenName = 'HomeScreen';
        } else {
          screenName += 'Screen';
        }
      }

      console.log(`UXCam: Path changed to ${pathname}, tagging as ${screenName}`);
      RNUxcam.tagScreenName(screenName);
    }
  }, [pathname]);

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
        enableAutomaticScreenNameTagging: false,
        enableAdvancedGestureRecognition: true,
        enableImprovedScreenCapture: true,
        disableAutoRecord: true,
        occlusionType: 0,
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
