import { MapState, useMap } from '@/modules/map/MapContext';
import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native';

export function LocationInfo() {
    const { longitude, latitude, setState } = useMap();  
    let apiKey = process.env.EXPO_PUBLIC_GOOGLEMAPS_API_KEY as string

    const [address, setAddress] = useState("15 rue de l'artiste");
    const [name, setName] = useState("No Name");
    const [isVisible, setIsVisible] = useState(true); 
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        console.log("Component Loaded");
        console.log(latitude, longitude);
        fetchLocationData();
    }, []);

    async function fetchLocationData() {
        //45.4953
        //-73.5798

        const radius = 50;
        //const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${45.4953},${-73.5798}&radius=${radius}&key=${apiKey}`;
        const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&key=${apiKey}`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.results.length > 0) {
                setAddress(data.results[0]?.name || "Address not available");
                setName(data.results[1]?.name || "Name not available");

                let openOrNah = data.results[1].opening_hours;
                if(openOrNah){
                    setIsOpen(true);
                }
               
            }

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    if (!isVisible) {
        setState(MapState.Idle);
        return null;
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setIsVisible(false)}>
                <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>

            <Text style={styles.nameText}>{name}</Text>
            <Text style={styles.addressText}>{address}</Text>
            <Text style={[
                styles.isOpen, 
                { color: isOpen ? 'green' : 'red' }
            ]}>
                {isOpen ? "Open Now" : "Closed Now"}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: '40%',  
        backgroundColor: 'white',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 10
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#ccc',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeText: {
        color: 'black',
        fontSize: 20,
        lineHeight: 20,
    },
    nameText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        marginTop: 10,
    },
    addressText: {
        fontSize: 16,
        color: 'gray',
    },
    isOpen: {
        fontSize: 16,
    }
});
