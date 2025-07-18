//App.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";

export default function App() {
  const [location, setLocation] = useState(null);
  const [poiData, setPoiData] = useState([]);

  const GEOAPIFY_API_KEY = "bfc67c01aadf4b9b9e3d83004a49012f";
  const CATEGORIES = "commercial.food_and_drink, catering.restaurant"; //restuarants and dtinks API locations
  const RADIUS_METERS = 100000; //100kms
  const RESULT_LIMIT = 50; //50 results

  useEffect(() => {
    const getLocationAndPOIs = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {``
        console.log("location denied");
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = currentLocation.coords;
      setLocation({ latitude, longitude });

      const url = `https://api.geoapify.com/v2/places?categories=${CATEGORIES}&conditions=named&filter=circle:${longitude},${latitude},${RADIUS_METERS}&limit=${RESULT_LIMIT}&apiKey=${GEOAPIFY_API_KEY}`;

      try {
        const response = await fetch(url);
        const json = await response.json();
        setPoiData(json.features || []);
      } catch (error) {
        console.log("Error fetching POIs:", error);
      }
    };

    getLocationAndPOIs();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Displaying hotels and restaurants near you...
        </Text>
      </View>

      {location && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation={true}
        >
          {poiData.map((poi, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: poi.geometry.coordinates[1],
                longitude: poi.geometry.coordinates[0],
              }}
            >
              <Callout tooltip>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>
                    {poi.properties.name || "Unnamed Location"}
                  </Text>
                  <Text style={styles.calloutDescription}>
                    {poi.properties.address_line2 || "No address available"}
                  </Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      )}
    </SafeAreaView>
  );
}

//STYLING 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? StatusBar.currentHeight || 20 : 0,
    backgroundColor: "#fff",
  },

  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: "#fff",
    alignItems: "center",
  },

  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1782c9ff",
    textAlign: "left",
  },
  
  map: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    marginHorizontal: 8,
  },

  //referenced from assignment document

  calloutContainer: {
    width: 200,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: -10,
  },

  calloutTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },

  calloutDescription: {
    fontSize: 12,
  },
});
