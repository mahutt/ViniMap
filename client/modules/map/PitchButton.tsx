import { StyleSheet,Button,View, TouchableOpacity,Text} from 'react-native';
import Mapbox from '@rnmapbox/maps';
import React from 'react';
import { useMap } from './MapContext';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';


export default function PitchButton() {
  const {  pitchLevel,setPitchLevel ,setZoomLevel,zoomLevel,cameraRef,centerCoordinate, mapRef} = useMap();

  const pressHandler =async  () =>{
    const currentZoom = await mapRef.current?.getZoom() as number
    setZoomLevel(currentZoom )
    const newPitch =(pitchLevel == 75)?0:75
    setPitchLevel( newPitch) 
   
  
  }
  return (
    <View style={styles.pitchButtonContainer}>
        <TouchableOpacity onPress={ pressHandler }><MaterialCommunityIcons name="angle-obtuse" size={35} color="white"  /></TouchableOpacity>
    
    </View>
  );
}

const styles = StyleSheet.create({
  pitchButtonContainer: {
   position:'absolute',
   zIndex:100,
   right:'4%',
   top:'92%',
   backgroundColor:'#912338',
   borderRadius:50,
   height:50,
   width:50,

  justifyContent:'center',
  alignItems:'center',
  opacity:0.89,
  

  
    
  },
  
 
  
});
