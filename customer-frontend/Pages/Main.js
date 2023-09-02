import { StyleSheet, Text, View, TextInput, Button,TouchableOpacity, Alert } from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import {useState, useEffect, useRef} from 'react'
import polyline from '@mapbox/polyline';
import getDirections from 'react-native-google-maps-directions'
import * as Location from 'expo-location'

const url = "https://e83e-2600-1700-4bec-220-74c6-7b90-325f-7f0c.ngrok-free.app/api/order/"
const url2 = "https://e83e-2600-1700-4bec-220-74c6-7b90-325f-7f0c.ngrok-free.app/api/user/"
const url3 = "https://e83e-2600-1700-4bec-220-74c6-7b90-325f-7f0c.ngrok-free.app/api/ping/"

export default function Main({navigation, loggedIn, setLoggedIn}) {

  const [originAddress, setOriginAddress] = useState(null)
  const [destinationAddress, setDestinationAddress] = useState(null)
  const [origin, setOrigin] = useState(null)
  const [destination, setDestination] = useState(null)
  const [price, setPrice] = useState(null)
  const [location, setLocation] = useState(null)
  const [decodedCoordinates, setDecodedCoordinates] = useState(null)
  const [profile, setProfile] = useState(null)
  const [order, setOrder] = useState(null)
  const [driver, setDriver] = useState(null)

  const orderRef = useRef(order)

  useEffect(() => {
    const getPermissions = async() => {
      let {status} = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted'){
      console.log("Please Grant Permission")
      return
    }
    else{
      let loc = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High},
        (clocation) => {
          console.log("Cloc:" ,clocation.coords)
          setLocation({latitude:  clocation.coords['latitude'], longitude: clocation.coords['longitude'] });
        }
      )
      return () => {
        loc.remove();
      };
    }
    }
    getPermissions()

    getCustomer()
    const intervalId = setInterval(() => ping(), 5000)
    return () => {
        clearInterval(intervalId);
    };
  },[])

  useEffect(() => {
    orderRef.current = order
    if (order){
        if (order.driver){
            let data = {longitude: parseFloat(order.driver['lon']), latitude: parseFloat(order.driver['lat'])}
            console.log("Driver coords: ", data)
            setDriver(data)
        }
    }
  }, [order])

  useEffect(() => {
    if (order && destination){
        viewRoute()
    }
  }, [order, destination])

  async function ping(){
    if (orderRef.current){
        let response = await fetch(url3)
        let data = await response.json()
        console.log(data)
        setOrder(data)
    }
  }

  async function getCustomer(){
    let response = await fetch(url2, {
        method: "PUT",
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({
            'type': 'Customer',
            'cmd': 'getUser'
        })
      })
    let data = await response.json()
    console.log("getCustomer: ", data)
    if (response.status !== 500){
        setLoggedIn(true)
        setProfile(data)
        response = await fetch(url3)
        data = await response.json()
        if (response.status !== 404){
            setOrder(data)
            setOrigin({latitude: data['oLat'], longitude: data['oLon']})
            setDestination({latitude: data['dLat'], longitude: data['dLon']})
        }
    }
    else{
        navigation.navigate('Login')
    }
  }

  async function getOrigin(){
    const geocodedLocation = await Location.geocodeAsync(originAddress)
    console.log("Geocoded location: ", geocodedLocation)
    //setOrigin(geocodedLocation)
    if (geocodedLocation){
      setOrigin({latitude: geocodedLocation[0]['latitude'], longitude: geocodedLocation[0]['longitude']})
    }
  }

  async function getDestination(){
    const geocodedLocation = await Location.geocodeAsync(destinationAddress)
    console.log("Geocoded location: ", geocodedLocation)
    if (geocodedLocation){
      setDestination({latitude: geocodedLocation[0]['latitude'], longitude: geocodedLocation[0]['longitude']})
    }
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
            "latLng": origin
          }
        },
        "destination":{
          "location":{
            "latLng": destination
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
    console.log(data)
    let encodedPolyline = data['routes'][0]['polyline']["encodedPolyline"]
    let dist = data['routes'][0]['distanceMeters'] // In meters
    dist = dist * 0.000621371
    let duration = parseInt(data['routes'][0]['duration']) // In seconds
    duration = duration/60
    console.log(duration)
    let decoded = polyline.decode(encodedPolyline)
    setDecodedCoordinates(decoded.map(coordi => ({
      latitude: coordi[0],
      longitude: coordi[1]
    })))
  }

  async function createOrder(){
    const response = await fetch(url, {
      method: 'POST',
      headers:{
        "Content-type": "application/json"
      },
      body: JSON.stringify({
        "oLat": origin.latitude,
        "oLon": origin.longitude,
        "dLat": destination.latitude,
        "dLon": destination.longitude,
        'price': price,
      })
    })
    let data = await response.json()
    console.log(data)
    setOrder(data)
  }

  function login(){
    navigation.navigate('Login')
  }

  function profilePage(){
    navigation.navigate('Profile')
  }

  return (
    <View style={{flex: 1, backgroundColor: 'gray', top: 45}}>
        {(loggedIn && !order) &&
        <>
            <View  style={{flexDirection: 'row', height: 50, alignContent: 'center', left: 40}}>
                <TextInput placeholder='Start Address' value={originAddress} onChangeText={setOriginAddress} style={{width: '60%'}}/>
                <TouchableOpacity style={{width: 35, height: 35, borderRadius: 100, backgroundColor: 'white', left: 30}}></TouchableOpacity>
                <TouchableOpacity style={{width: 35, height: 35, borderRadius: 100, backgroundColor: 'white', left: 40}} onPress={getOrigin}></TouchableOpacity>
            </View>
            <View  style={{flexDirection: 'row', height: 50, alignContent: 'center', left: 40}}>
                <TextInput placeholder='End Address' value={destinationAddress} onChangeText={setDestinationAddress} style={{width: '60%'}}/>
                <TouchableOpacity style={{width: 35, height: 35, borderRadius: 100, backgroundColor: 'white', left: 30}}></TouchableOpacity>
                <TouchableOpacity style={{width: 35, height: 35, borderRadius: 100, backgroundColor: 'white', left: 40}} onPress={getDestination}></TouchableOpacity>
            </View>
            <TextInput placeholder='Price' value={price} onChangeText={setPrice} />
            <TouchableOpacity style={{width: 50, height: 50, backgroundColor: 'black'}} onPress={viewRoute}></TouchableOpacity>
            <TouchableOpacity style={{width: 50, height: 50, backgroundColor: 'white'}} onPress={createOrder}></TouchableOpacity>
        </>
        }

        {location && <MapView provider={PROVIDER_GOOGLE} style={{flex:1}}
            initialRegion={{
            latitude: location['latitude'],
            longitude: location['longitude'],
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
            }} customMapStyle={mapStyling}>
            {location && <Marker coordinate={location} title="Current Location" pinColor="blue"/>}
            {driver && <Marker coordinate={driver} title="Driver Location" pinColor= 'green'/>}
            {origin && <Marker title="Origin" coordinate={origin}/>}
            {destination && <Marker title="Destination" coordinate={destination}/>}
            {decodedCoordinates && <Polyline coordinates={decodedCoordinates} strokeColor='#FFF' strokeWidth={5}/>}
        </MapView>}
        {!loggedIn && <TouchableOpacity style={{position: 'absolute', bottom: 60, width: 50, height: 50, borderRadius:100, left: 20, backgroundColor: 'white'}} onPress={login}></TouchableOpacity>}
        {loggedIn && <TouchableOpacity style={{position: 'absolute', bottom: 60, width: 50, height: 50, borderRadius:100, left: 20, backgroundColor: 'gray'}} onPress={profilePage}></TouchableOpacity>}
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