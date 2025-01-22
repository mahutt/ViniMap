import { Image, StyleSheet, Platform,View,Text } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import React, { useState } from 'react';
import MapView ,{PROVIDER_GOOGLE} from 'react-native-maps';

import Toggle from "react-native-toggle-element";

import GoogleMap from '@/components/map/googleMap';
export default function HomeScreen() {


  return (
    <GoogleMap></GoogleMap>
  );
}
