import { StyleSheet, Text, View, TextInput, Button,TouchableOpacity, Alert } from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import {useState, useEffect} from 'react'
import polyline from '@mapbox/polyline';
import getDirections from 'react-native-google-maps-directions'
import * as Location from 'expo-location'

const url = "https://e83e-2600-1700-4bec-220-74c6-7b90-325f-7f0c.ngrok-free.app/api/order/"

export default function App() {

  const [address, setAddress] = useState(null)
  const [origin, setOrigin] = useState({})
  const [destination, setDestination] = useState({})
  const [location, setLocation] = useState(null)

  useEffect(() => {
    const getPermissions = async() => {
      let {status} = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted'){
        console.log("Please Grant Permission")
        return
      }
      else{
        let currentLocation = await Location.getCurrentPositionAsync({})
        setLocation(currentLocation)
        console.log("Location: ", currentLocation)
      }
    }
    getPermissions()
  },[])

  async function originGeocode(){
    const geocodedLocation = await Location.geocodeAsync(address)
    console.log("Geocoded location: ", geocodedLocation)
  }

  return (
    <View style={{flex: 1}}>
      {location && <MapView provider={PROVIDER_GOOGLE} style={{flex:1}}
        initialRegion={{
          latitude: location['coords']['latitude'],
          longitude: location['coords']['longitude'],
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        customMapStyle={mapStyling}
        >
        {/* {!inRide && startCoordinates.map((coord) => (
          <Marker key={coord.id} title="Origin" onPress={() => viewRoute(coord)} coordinate={
            {
              latitude: coord.oLat,
              longitude: coord.oLon
            }
          } />
          ))} */}
        {/* {(destinationCoordinate && inRide) && <Marker coordinate={destinationCoordinate} />}
        {(origin && inRide) && <Marker coordinate={origin} />} */}
        {/* {showPolyline && <Text style={{
          position: "absolute", color: "white", bottom: 20, backgroundColor: "gray", textAlign: "center", fontSize: 40, height: 50
        }} >Accept Ride</Text>} */}
        {/* {showPolyline && (<Polyline coordinates={decodedCoordinates} strokeColor="#FFF" strokeWidth={5} />)}
        {(showPolyline && destinationCoordinate) && (<Marker coordinate={destinationCoordinate} title="Destination" />)} */}
      </MapView>}
      {/* <View>
        <TextInput placeholder='Start Address' value={address} onChangeText={setAddress} />
        <Button title="Geocode Address" onPress={originGeocode} />
      </View>
      <View>
        <TextInput placeholder='Start Address' value={address} onChangeText={setAddress} />
        <Button title="Geocode Address" onPress={originGeocode} />
      </View> */}
    </View>
  );
}



const mapStyling = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#1d2c4d"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#8ec3b9"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1a3646"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#4b6878"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#64779e"
      }
    ]
  },
  {
    "featureType": "administrative.province",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#4b6878"
      }
    ]
  },
  {
    "featureType": "landscape.man_made",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#334e87"
      }
    ]
  },
  {
    "featureType": "landscape.natural",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#023e58"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#283d6a"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#6f9ba5"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1d2c4d"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#023e58"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#3C7680"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#304a7d"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#98a5be"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1d2c4d"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#2c6675"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#255763"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#b0d5ce"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#023e58"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#98a5be"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1d2c4d"
      }
    ]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#283d6a"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#3a4762"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#0e1626"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#4e6d70"
      }
    ]
  }
]