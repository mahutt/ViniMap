import { Image, StyleSheet, Platform,View,Text } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import React, { useEffect, useState } from 'react';
import MapView ,{PROVIDER_GOOGLE, Marker} from 'react-native-maps';

import Toggle from "react-native-toggle-element";

export default function GoogleMap(this: any) {


  const SGW =  {latitude: 45.4969401, 
    longitude: -73.5783425, 
    latitudeDelta: 0.006, //Change this for zoom
    longitudeDelta: 0.006, // Change this for zoom
  }
  
  const Loyola = {
    latitude: 45.45789, 
    longitude: -73.63905, 
    latitudeDelta: 0.007, 
    longitudeDelta: 0.007, 
  }

  const [toggleValue,setToggleValue]= useState(false);

  useEffect(()=> {
    setCampus(SGW)
  },[])

  
  


  const[campus,setCampus] = useState(SGW)
 

  const toggleCampus = () =>{
    console.log("switching campuses")
     setCampus((prevCampus) => JSON.stringify(prevCampus) === JSON.stringify(SGW)? Loyola : SGW)
  
    setToggleValue((prev)=> !prev)
     
  }


  return (
    <View style={{flex: 1}}>
      <MapView
        key = {JSON.stringify(campus)} //temp solution  
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE} 
        region={campus}
        showsBuildings={true}
      >
      </MapView>
        
    

    <View style = {{position: "absolute", bottom:50,left:20}}>
    <Toggle
  value={toggleValue}
  onPress={toggleCampus}
  leftTitle="SGW"
  rightTitle="Loyola"
/>
    </View>
   
  </View>
  );
}
