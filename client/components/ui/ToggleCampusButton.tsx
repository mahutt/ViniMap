import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { useMap } from "@/modules/map/MapContext"; 

interface ToggleCampusButtonProps {
  style?: StyleProp<ViewStyle>; 
}

const ToggleCampusButton: React.FC<ToggleCampusButtonProps> = ({ style }) => {
  const [selectedLocation, setSelectedLocation] = useState<"SGW" | "LOY">("SGW");
  const { flyTo } = useMap();

  const SGW_COORDINATES: [number, number] = [-73.5789, 45.4973];
  const LOY_COORDINATES: [number, number] = [-73.6391, 45.4581];

  const handleToggle = (location: "SGW" | "LOY") => {
    setSelectedLocation(location);
    if (location === "SGW") {
      flyTo(SGW_COORDINATES);
    } else {
      flyTo(LOY_COORDINATES);
    }
  };

  return (
    <View style={[styles.container, styles.toggleButton, style]}>
      <TouchableOpacity
        style={[
          styles.button,
          selectedLocation === "SGW" ? styles.activeButton : null,
        ]}
        onPress={() => handleToggle("SGW")}
      >
        <Text
          style={[
            styles.text,
            selectedLocation === "SGW" ? styles.activeText : null,
          ]}
        >
          SGW
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.button,
          selectedLocation === "LOY" ? styles.activeButton : null,
        ]}
        onPress={() => handleToggle("LOY")}
      >
        <Text
          style={[
            styles.text,
            selectedLocation === "LOY" ? styles.activeText : null,
          ]}
        >
          LOY
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f3f3",
    borderRadius: 25,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    width: 138,
    position: "absolute",
    borderWidth: 2,
    borderColor: "#800000",
    zIndex: 2,
  },
  button: {
    flex: 1,
    paddingVertical: 2,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
  },
  activeButton: {
    backgroundColor: "white",
  },
  text: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#800000",
  },
  activeText: {
    color: "#800000",
  },
  toggleButton: {
    top: 125, 
    left: 39, 
    right: 20, 
  },
});

export default ToggleCampusButton;
