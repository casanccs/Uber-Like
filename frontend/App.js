import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button,TouchableOpacity } from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import {useState, useEffect} from 'react'
import polyline from '@mapbox/polyline';
import getDirections from 'react-native-google-maps-directions'
// import Geolocation from 'react-native-geolocation-service'

const origin1 = {latitude: 29.543475,longitude: -95.149490}
const url = "https://e83e-2600-1700-4bec-220-74c6-7b90-325f-7f0c.ngrok-free.app/api/order/"

export default function App() {

  // This is by far not a good way to do it
  const [decodedCoordinates, setDecodedCoordinates] = useState([])
  const [destinationCoordinate, setDestinationCoordinate] = useState(null);
  const [showPolyline, setShowPolyline] = useState(false)
  const [startCoordinates, setStartCoordinates] = useState([])
  const [origin, setOrigin] = useState(null)
  const [price, setPrice] = useState(null)
  const [time, setTime] = useState(null)
  const [distance, setDistance] = useState(null)
  const [id, setId] = useState(null)
  const [inRide, setInRide] = useState(false)


  function cancel(){
    setShowPolyline(false)
    setPrice(null)
    setTime(null)
    setDistance(null)
    setDestinationCoordinate(null)
  }

  useEffect(() => {
    getOrders()
  },[])

  async function refresh(){
    let response = await fetch(url)
    let data = await response.json()
    setStartCoordinates(data)
  }

  async function getOrders(){
    let response = await fetch(url)
    let data = await response.json()
    setStartCoordinates(data)
  }

  async function viewRoute(coord){
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
            "latLng":{latitude: coord.oLat, longitude: coord.oLon}
          }
        },
        "destination":{
          "location":{
            "latLng":{latitude: coord.dLat, longitude: coord.dLon}
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
    let dist = data['routes'][0]['distanceMeters'] // In meters
    dist = dist * 0.000621371
    console.log(data)
    let duration = parseInt(data['routes'][0]['duration']) // In seconds
    duration = duration/60
    console.log(duration)
    let decoded = polyline.decode(encodedPolyline)
    setDecodedCoordinates(decoded.map(coordi => ({
      latitude: coordi[0],
      longitude: coordi[1]
    })))
    // I should also create a Marker and put it on the MapView at this point
    setDestinationCoordinate({latitude: coord.dLat, longitude: coord.dLon})
    setOrigin({latitude: coord.oLat, longitude: coord.oLon})
    setShowPolyline(true)
    setPrice(coord.price)
    setDistance(dist)
    setTime(duration)
    setId(coord.id)
  }

  async function acceptRide(){
    setInRide(true)
    let response = await fetch(url, {
      method: "PUT", // This will already have all the information that is needed, which is the user info
      headers:{
        "Content-type": "application/json"
      },
      body: JSON.stringify({
        "id": id,
        "type": "accept"
      })
    })
    let data = await response.json()
    console.log(data)
    // Now that order is unavailable. So you must hide all orders other than this one in the app's map
    // As a response, you must get the user's name, and a photo of them.

  }
  async function cancelRide(){
    setInRide(false)
    let response = await fetch(url, {
      method: "PUT", // This will already have all the information that is needed, which is the user info
      headers:{
        "Content-type": "application/json"
      },
      body: JSON.stringify({
        "id": id,
        "type": "cancel"
      })
    })
    let data = await response.json()
    console.log(data)

  }
  
  async function handleGetDirections(){
    const dirData = {
      // source: origin,
      destination: destinationCoordinate,
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
      waypoints: [origin, destinationCoordinate]
    }
    getDirections(dirData)
  }


  return (
    <View style={{flex: 1}} >
      <MapView provider={PROVIDER_GOOGLE} style={{flex:1}} // NOTE!!! This should be the Geolocation
        initialRegion={{
          latitude: origin1["latitude"],
          longitude: origin1["longitude"],
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        customMapStyle={mapStyling}
        >
        {!inRide && startCoordinates.map((coord) => (
          <Marker key={coord.id} title="Origin" onPress={() => viewRoute(coord)} coordinate={
            {
              latitude: coord.oLat,
              longitude: coord.oLon
            }
          } />
          ))}
        {(destinationCoordinate && inRide) && <Marker coordinate={destinationCoordinate} />}
        {(origin && inRide) && <Marker coordinate={origin} />}
        {/* {showPolyline && <Text style={{
          position: "absolute", color: "white", bottom: 20, backgroundColor: "gray", textAlign: "center", fontSize: 40, height: 50
        }} >Accept Ride</Text>} */}
        {showPolyline && (<Polyline coordinates={decodedCoordinates} strokeColor="#FFF" strokeWidth={5} />)}
        {(showPolyline && destinationCoordinate) && (<Marker coordinate={destinationCoordinate} title="Destination" />)}
      </MapView>
      {!inRide && <TouchableOpacity style={{position: 'absolute', top: 70, left:25,width: 50, height: 50, backgroundColor: 'blue', borderRadius: 200}} onPress={refresh}>
        <View></View>
      </TouchableOpacity>}
      { inRide && <TouchableOpacity style={{position: 'absolute', top: 70, right:25,width: 50, height: 50, backgroundColor: 'blue', borderRadius: 200}} onPress={cancelRide}>
        <View></View>
      </TouchableOpacity>}
      {(showPolyline && !inRide) && (<TouchableOpacity onPress={cancel}>
        <View style={{position: 'absolute', backgroundColor: 'gray', width: 50, height: 50, bottom: 800, right: 30, borderRadius: 200}}  />
      </TouchableOpacity>)}
      {(showPolyline && !inRide) && <Text style={{
        position: "absolute", color: "white", bottom: 30, backgroundColor: '#2e2e2e', textAlign: "center", fontSize: 40, height: 50, width: '100%'
        }} onPress={acceptRide}>Accept Ride</Text>}
      {inRide && <Text style={{
        position: "absolute", color: "white", bottom: 30, backgroundColor: '#2e2e2e', textAlign: "center", fontSize: 40, height: 50, width: '100%'
        }} onPress={handleGetDirections}>View Directions</Text>}
      {price && <Text style={{backgroundColor: "gray", bottom: 80, fontSize: 35, position: 'absolute', width: '100%', textAlign: 'center', color: 'white'}}>
        Price: ${parseFloat(price).toFixed(2)}</Text>}
      {distance && <Text style={{backgroundColor: "gray", bottom: 120, fontSize: 35, position: 'absolute', width: '100%', textAlign: 'center', color: 'white'}}>
        Distance: {distance.toFixed(2)} miles</Text>}
      {time != null && <Text style={{backgroundColor: "gray", bottom: 160, fontSize: 35, position: 'absolute', width: '100%', textAlign: 'center', color: 'white'}}>
        Time: {time.toFixed(2)} minutes</Text>}
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