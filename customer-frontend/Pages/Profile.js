import {useEffect, useState} from 'react'
import { View, Button, Text, TextInput, Linking } from 'react-native'

let url = "https://e83e-2600-1700-4bec-220-74c6-7b90-325f-7f0c.ngrok-free.app/api/user/"
let url2 = "https://e83e-2600-1700-4bec-220-74c6-7b90-325f-7f0c.ngrok-free.app/api/charge/"

export default function Profile({navigation}){

    const [profile, setProfile] = useState(null)
    const [value, setValue] = useState(0)

    useEffect(() => {
        getCustomer()
    },[])

    async function getCustomer(){
        let response = await fetch(url, {
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
        setProfile(data)
      }

    async function addBalance(){
        let response = await fetch(url2, {
            method: "POST",
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                amount: value
            })
        })
        let data = await response.json()
        console.log("Output: ", data)
        Linking.canOpenURL(data['url'])
            .then((supported) => {
                if (supported){
                    Linking.openURL(data['url'])
                } else{
                    console.error("Cannot open the stripe url")
                }
            })
            .catch((error) => {
                console.error("An error occured with stripe url")
            })
    }

    const incrementValue = () => {
        setValue(value + 1);
    };
    
    const decrementValue = () => {
        if (value > 0) {
            setValue(value - 1);
        }
    };

    return (
        <>
            {profile && (<>
                <Text>Profile</Text>
                <Text>Username: {profile.user.username}</Text>
                <Text>Email: {profile.user.email}</Text>
                <Text>Full Name: {profile.user.first_name} {profile.user.last_name}</Text>
                <Text>Balance: {profile.balance}</Text>
                <Text>Balance to Add:</Text>
                <Button title="+" onPress={incrementValue} />
                <Text>{value}</Text>
                <Button title="-" onPress={decrementValue} />
                <Text onPress={addBalance}>Add Balance</Text>
            </>)}
        </>
    )
}

