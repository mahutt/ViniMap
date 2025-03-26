import { useState, useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import GoogleService from '@/services/GoogleService';
import { Alert } from 'react-native';

export interface UserInfo {
  picture?: string;
  [key: string]: any;
}

export function useGoogleAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // google auth request
  const [request, response, promptAsync] = Google.useAuthRequest(GoogleService.config);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await GoogleService.isSignedIn();
        const storedUserInfo = isAuthenticated ? GoogleService.getUserInfoFromStorage() : null;

        setIsLoggedIn(isAuthenticated);
        setUserInfo(storedUserInfo);
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { access_token } = response.params;
      handleGoogleLogin(access_token);
    }
  }, [response]);

  const handleGoogleSignIn = () => {
    if (request) {
      promptAsync();
    } else {
      Alert.alert('Error', 'Cannot initialize Google Sign-In');
    }
  };

  const handleGoogleLogin = async (accessToken: string) => {
    try {
      const userData = await GoogleService.getUserInfo(accessToken);
      GoogleService.saveUserInfo(userData, accessToken);

      setIsLoggedIn(true);
      setUserInfo(userData);
      return true;
    } catch (error) {
      console.error('Error during Google login:', error);
      Alert.alert('Login Failed', 'Could not complete the login process.');
      return false;
    }
  };

  const handleSignOut = async () => {
    try {
      await GoogleService.signOut();
      setIsLoggedIn(false);
      setUserInfo(null);
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
      return false;
    }
  };

  return {
    isLoggedIn,
    userInfo,
    handleGoogleSignIn,
    handleGoogleLogin,
    handleSignOut,
  };
}
