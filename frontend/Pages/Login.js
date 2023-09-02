import {useState} from 'react'
import { Text, TextInput, Button } from 'react-native'

let url = "https://e83e-2600-1700-4bec-220-74c6-7b90-325f-7f0c.ngrok-free.app/api/user/"

export default function Login({navigation, loggedIn, setLoggedIn}){

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    async function login(){
        let response = await fetch(url, {
            method: "PUT",
            headers:{
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                'username': username,
                'password': password,
                'type': 'Driver',
                'cmd': 'login'
            })
        })
        let data = await response.json()
        console.log(data)
        if (response.status !== 404){
            setLoggedIn(true)
            navigation.navigate('Main')
        }
        else{
            navigation.navigate('Login')
        }
    }

    function signUp(){
        navigation.navigate('CreateProfile')
    }

    return (
        <>
            <Text>Login</Text>
            <TextInput placeholder='Username' value={username} onChangeText={setUsername} />
            <TextInput placeholder='Password' value={password} onChangeText={setPassword} />
            <Text style={{borderWidth: 1, borderStyle: "solid", borderColor: "black"}} onPress={login}>Login</Text>
            <Text style={{borderWidth: 1, borderStyle: "solid", borderColor: "black"}} onPress={signUp}>Create Profile</Text>
        </>
    )
}