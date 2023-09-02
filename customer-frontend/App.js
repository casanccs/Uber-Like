import Main from './Pages/Main'
import Login from './Pages/Login';
import CreateProfile from './Pages/CreateProfile';
import Profile from './Pages/Profile';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { useState } from 'react';

const Stack = createNativeStackNavigator();

export default function App() {
  
  const [loggedIn, setLoggedIn] = useState(false)

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Main">{(props) => <Main {...props} loggedIn={loggedIn} setLoggedIn={setLoggedIn} />}</Stack.Screen>
        <Stack.Screen name="Login">{(props) => <Login {...props} loggedIn={loggedIn} setLoggedIn={setLoggedIn} />}</Stack.Screen>
        <Stack.Screen name="CreateProfile">{(props) => <CreateProfile {...props} loggedIn={loggedIn} setLoggedIn={setLoggedIn} />}</Stack.Screen>
        <Stack.Screen name="Profile">{(props) => <Profile {...props} />}</Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  )
}