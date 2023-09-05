import Main from './Pages/Main'
import Login from './Pages/Login';
import CreateProfile from './Pages/CreateProfile';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { useState, useEffect } from 'react';
import Profile from './Pages/Profile';
import { StripeProvider } from '@stripe/stripe-react-native';

const Stack = createNativeStackNavigator();
const url = "https://e83e-2600-1700-4bec-220-74c6-7b90-325f-7f0c.ngrok-free.app/api/user/"

export default function App() {
  
  const [loggedIn, setLoggedIn] = useState(false)

  
  return (
    <StripeProvider publishableKey='pk_test_51N1DGsJATRMkSFUkHJylWd15DLlhGBzl4jQFzzdeuBjNojtY9TsQSHKrVRlSHHLz5YVSSTxDCNOb5NbrxH8TLvIl00p0HO7vhR'>
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Main">{(props) => <Main {...props} loggedIn={loggedIn} setLoggedIn={setLoggedIn} />}</Stack.Screen>
        <Stack.Screen name="Login">{(props) => <Login {...props} loggedIn={loggedIn} setLoggedIn={setLoggedIn} />}</Stack.Screen>
        <Stack.Screen name="CreateProfile">{(props) => <CreateProfile {...props} loggedIn={loggedIn} setLoggedIn={setLoggedIn} />}</Stack.Screen>
        <Stack.Screen name="Profile">{(props) => <Profile {...props} />}</Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
    </StripeProvider>
  )
}