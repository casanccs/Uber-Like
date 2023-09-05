import {useEffect, useState} from 'react'
import { Text, TextInput } from 'react-native'
import { CardField, useStripe, Button } from '@stripe/stripe-react-native'

let url = "https://e83e-2600-1700-4bec-220-74c6-7b90-325f-7f0c.ngrok-free.app/api/user/"
let url2 = "https://e83e-2600-1700-4bec-220-74c6-7b90-325f-7f0c.ngrok-free.app/api/paymentIntent/"

export default function Profile(){

    const stripe = useStripe()
    const [profile, setProfile] = useState(null)
    const [cardNumber, setCardNumber] = useState('');
    const [expMonth, setExpMonth] = useState('');
    const [expYear, setExpYear] = useState('');
    const [cvc, setCvc] = useState('');

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

    async function cashout(){
        const response = await fetch(url2, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: profile['balance']*100, // Amount in cents
            }),
        })
        const data = await response.json()
        const {client_secret} = data
        console.log(client_secret)

        const {paymentMethod, error} = await stripe.createPaymentMethod({
            paymentMethodType: 'Card',
            card: {
                number: cardNumber,
                expMonth: parseInt(expMonth),
                expYear: parseInt(expYear),
                cvc: cvc,
              },
        })
        
        if (error) {
            console.error(error);
            return;
        }

        const result = await stripe.confirmPayment(client_secret, {
            payment_method: paymentMethod.id,
        });
    }

    return (
        <>
            <Text>Profile</Text>
            {profile && (<>
                <Text>Username: {profile.user.username}</Text>
                <Text>Email: {profile.user.email}</Text>
                <Text>Full Name: {profile.user.first_name} {profile.user.last_name}</Text>
                <Text>Balance: {profile.balance}</Text>
                <Text>Card Number</Text>
                <TextInput
                placeholder="Card Number"
                onChangeText={text => setCardNumber(text)}
                />

                <Text>Expiration Month</Text>
                <TextInput
                placeholder="Expiration Month"
                onChangeText={text => setExpMonth(text)}
                />

                <Text>Expiration Year</Text>
                <TextInput
                placeholder="Expiration Year"
                onChangeText={text => setExpYear(text)}
                />

                <Text>CVC</Text>
                <TextInput
                placeholder="CVC"
                onChangeText={text => setCvc(text)}
                />
                <CardField
                postalCodeEnabled={false} // Enable or disable postal code collection
                />
                <Text title="Pay" onPress={cashout}>Payout</Text>
            </>)}
        </>
    )
}

