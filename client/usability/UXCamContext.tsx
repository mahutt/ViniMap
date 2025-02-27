import React, { createContext, ReactNode, useEffect } from 'react';
import { usePathname } from 'expo-router';
import RNUxcam from 'react-native-ux-cam';

const UXCamContext = createContext<null>(null);

interface UXCamProviderProps {
  children: ReactNode;
}

export function UXCamProvider({ children }: UXCamProviderProps): JSX.Element {
  const pathname = usePathname();

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

  // handling screen name changes for usability testing
  useEffect(() => {
    if (pathname) {
      let screenName = 'Unknown';

      if (pathname === '/') {
        screenName = 'HomeScreen';
      } else if (pathname.startsWith('/')) {
        screenName = pathname.substring(1).replace(/\//g, '_').replace(/\W/g, '');

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
      RNUxcam.tagScreenName(screenName);
    }
  }, [pathname]);

  return <UXCamContext.Provider value={null}>{children}</UXCamContext.Provider>;
}
