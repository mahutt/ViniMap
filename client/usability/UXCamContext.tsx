import React, {
  createContext,
  ReactNode,
  useEffect,
  useState,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import { usePathname } from 'expo-router';
import RNUxcam from 'react-native-ux-cam';

interface UXCamContextType {
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
}

const UXCamContext = createContext<UXCamContextType | null>(null);

interface UXCamProviderProps {
  children: ReactNode;
}

export function UXCamProvider({ children }: UXCamProviderProps): JSX.Element {
  const pathname = usePathname();
  const [isRecording, setIsRecording] = useState(false);

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

  const startRecording = useCallback(() => {
    console.log('Starting new UXCam session...');
    RNUxcam.startNewSession();
    console.log('UXCam session started');
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    console.log('Stopping UXCam session...');
    RNUxcam.stopSessionAndUploadData();
    console.log('UXCam session stopped and upload requested');
    setIsRecording(false);
  }, []);

  const UXCamContextValue = useMemo(
    () => ({
      isRecording,
      startRecording,
      stopRecording,
    }),
    [isRecording, startRecording, stopRecording]
  );

  return <UXCamContext.Provider value={UXCamContextValue}>{children}</UXCamContext.Provider>;
}

export function useUXCam() {
  const context = useContext(UXCamContext);
  if (context === null) {
    throw new Error('useUXCam must be used within an UXCamProvider');
  }
  return context;
}
