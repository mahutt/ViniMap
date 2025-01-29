import { Button, StyleSheet, View } from 'react-native';
import React,{useState} from 'react';
import Mapbox from '@rnmapbox/maps';
import { SearchBar } from '@/components/SearchBar';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN as string);

// downtown concordia campus (sgw)
const DEFAULT_COORDINATES = {
  longitude: -73.5789,
  latitude: 45.4973,
};





export default function HomeScreen() {
  const mapRef = React.useRef<Mapbox.MapView | null>(null);
  const cameraRef = React.useRef<Mapbox.Camera | null>(null);

  const[floorFilter,setFloorFilter] = useState(['==','level','hall9'])

  const LAYER_ID = 'combined-geojson-dh6buu'

  const updateFloorFilter = async (level: string)=>{
    try{
      setFloorFilter(['==', 'level', level])

    }catch(error){
      console.error('Error updating filter: ',error)
    }
  }
  return (
    
   
    <View style={styles.container}>
      <Mapbox.MapView ref={mapRef} style={styles.map} styleURL='mapbox://styles/ambrose821/cm6g7anat00kv01qmbxkze6i8'>
        <Mapbox.Camera
          ref={cameraRef}
          zoomLevel={15}
          centerCoordinate={[DEFAULT_COORDINATES.longitude, DEFAULT_COORDINATES.latitude]}
          animationMode="flyTo"
          animationDuration={2000}
        />


          <Mapbox.ShapeSource
          id="floorSource"
          url="mapbox://ambrose821.bt7b663v"
        >
          <Mapbox.FillLayer
            id="combined-geojson-dh6buu"
            existing={true}
            sourceID="floorSource"
            filter={floorFilter} // Apply dynamic filtering
            style={{
              fillColor: 'hsl(0, 0%, 100%)', // White color as defined
              fillOutlineColor: '#5c15d5',   // Purple outline color
            }}
          />
        </Mapbox.ShapeSource>
      </Mapbox.MapView>
      <View style={styles.searchContainer}>
        <SearchBar onSearch={(query) => console.log(query)} />
      </View>
      <View>
      <Button title="Ground Floor" onPress={() => updateFloorFilter('hall9')} />
      <Button title="First Floor" onPress={() => updateFloorFilter('rewound')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  searchContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
