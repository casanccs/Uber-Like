import {useEffect, useState} from 'react'
import { Text, TextInput } from 'react-native'

let url = "https://e83e-2600-1700-4bec-220-74c6-7b90-325f-7f0c.ngrok-free.app/api/user/"

export default function Profile({navigation}){

    const [profile, setProfile] = useState(null)


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
                'type': 'Driver',
                'cmd': 'getUser'
            })
          })
        let data = await response.json()
        console.log("getCustomer: ", data)
        setProfile(data)
      }

    return (
        <>
            {profile && (<>
                <Text>Profile</Text>
                <Text>Username: {profile.user.username}</Text>
                <Text>Email: {profile.user.email}</Text>
                <Text>Full Name: {profile.user.first_name} {profile.user.last_name}</Text>
                <Text>Balance: {profile.balance}</Text>
            </>)}
        </>
    )
}

