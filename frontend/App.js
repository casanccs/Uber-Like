import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button,TouchableOpacity } from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import {useState} from 'react'
import polyline from '@mapbox/polyline';
import getDirections from 'react-native-google-maps-directions'
// import Geolocation from 'react-native-geolocation-service'

const origin = {latitude: 29.543475,longitude: -95.149490}
const destination = {latitude: 29.750322,longitude: -95.360793}


export default function App() {

  const [decodedCoordinates, setDecodedCoordinates] = useState([])
  const [destinationCoordinate, setDestinationCoordinate] = useState(null);
  const [showPolyline, setShowPolyline] = useState(false)

  function cancel(){
    setShowPolyline(false)
    console.log("hi")
  }

  async function viewRoute(){
    let response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': 'AIzaSyCBZD28SfZeIxWtvqXyn_oRTu2NbQxfI5c',
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline'
      },
      body: JSON.stringify({
        "origin":{
          "location":{
            "latLng":origin
          }
        },
        "destination":{
          "location":{
            "latLng":destination
          }
        },
        "travelMode": "DRIVE",
        "routingPreference": "TRAFFIC_AWARE",
        "departureTime": "2023-10-15T15:01:23.045123456Z",
        "computeAlternativeRoutes": false,
        "routeModifiers": {
          "avoidTolls": false,
          "avoidHighways": false,
          "avoidFerries": false
        },
        "languageCode": "en-US",
        "units": "IMPERIAL"
      })
    })
    let data = await response.json()
    let encodedPolyline = data['routes'][0]['polyline']["encodedPolyline"]
    let distance = data['routes'][0]['distanceMeters'] // In meters
    distance = distance * 0.000621371
    let duration = data['routes'][0]['duration'] // In seconds
    duration = duration/60
    console.log(distance)
    let decoded = polyline.decode(encodedPolyline)
    setDecodedCoordinates(decoded.map(coord => ({
      latitude: coord[0],
      longitude: coord[1]
    })))
    // I should also create a Marker and put it on the MapView at this point
    setDestinationCoordinate(destination)
    setShowPolyline(true)
  }

  async function handleGetDirections(){
    const dirData = {
      // source: origin,
      destination: destination,
      params: [
        {
          key: 'travelmode',
          value: 'driving',
        },
        {
          key: 'dir_action',
          value: 'navigate',
        }
      ],
      waypoints: [origin]
    }
    getDirections(dirData)
  }

  return (
    <View style={{flex: 1}} >
      <MapView provider={PROVIDER_GOOGLE} style={{flex:1}}
        initialRegion={{
          latitude: origin["latitude"],
          longitude: origin["longitude"],
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}>
        <Marker coordinate={origin} title="Origin" onPress={viewRoute}/>
        {/* {showPolyline && <Text style={{
        position: "absolute", color: "white", bottom: 20, backgroundColor: "gray", textAlign: "center", fontSize: 40, height: 50
        }} >Accept Ride</Text>} */}
        {showPolyline && (<Polyline coordinates={decodedCoordinates} strokeColor="#000" strokeWidth={4} />)}
        {(showPolyline && destinationCoordinate) && (<Marker coordinate={destinationCoordinate} title="Destination" />)}
      </MapView>
      {showPolyline && (<TouchableOpacity onPress={cancel}>
        <View style={{position: 'absolute', backgroundColor: 'gray', width: 50, height: 50, bottom: 800, right: 30, borderRadius: 200}}  />
      </TouchableOpacity>)}
      {showPolyline && <Text style={{
        position: "absolute", color: "white", bottom: 30, backgroundColor: "gray", textAlign: "center", fontSize: 40, height: 50, width: '100%'
        }} onPress={handleGetDirections}>Accept Ride</Text>}
    </View>
  );
}
