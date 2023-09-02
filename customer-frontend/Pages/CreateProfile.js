import {useState} from 'react'
import { Text, TextInput, Button } from 'react-native'

let url = "https://e83e-2600-1700-4bec-220-74c6-7b90-325f-7f0c.ngrok-free.app/api/user/"

export default function CreateProfile({navigation}){

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [email, setEmail] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")

    async function signUp(){
        let response = await fetch(url, {
            method: "POST",
            headers:{
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                'username': username,
                'password': password,
                'email': email,
                'firstName': firstName,
                'lastName': lastName,
                'type': 'Customer'
            })
        })
        let data = await response.json()
        console.log(data)
        navigation.navigate('Login')
    }

    function login(){
        navigation.navigate('Login')
    }

    return (
        <>
            <Text>Create Profile</Text>
            <TextInput placeholder='Username' value={username} onChangeText={setUsername} />
            <TextInput placeholder='Password' value={password} onChangeText={setPassword} />
            <TextInput placeholder='email' value={email} onChangeText={setEmail} />
            <TextInput placeholder='First Name' value={firstName} onChangeText={setFirstName} />
            <TextInput placeholder='Last Name' value={lastName} onChangeText={setLastName} />
            <Text style={{borderWidth: 1, borderStyle: "solid", borderColor: "black"}} onPress={signUp}>Create Profile</Text>
            <Text style={{borderWidth: 1, borderStyle: "solid", borderColor: "black"}} onPress={login}>Login</Text>
        </>
    )
}