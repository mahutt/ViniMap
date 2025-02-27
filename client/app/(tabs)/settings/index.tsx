import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import SettingsItem from '../../../components/SettingsItem';
import RecordingButton from '../../../components/RecordingButton';

export default function SettingsScreen() {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
        }}
      />
      <View style={styles.container}>
        <View style={styles.content}>
          <SettingsItem title="Language" route="/settings/language" />
          <SettingsItem title="Text Size" route="/settings/textsize" />
          <SettingsItem title="Color Blindness" route="/settings/colorblind" />
          <RecordingButton isRecording={isRecording} setIsRecording={setIsRecording} />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 16,
  },
});
