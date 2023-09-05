from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import authenticate
from .serializers import *
from decimal import Decimal
import jwt
from django.conf import settings
import stripe


stripe.api_key = settings.STRIPE_SECRET_KEY

def getUser(request):
    token = request.COOKIES.get('jwt')
    if not token:
        raise AuthenticationFailed('unauthed token')
    try:
        payload = jwt.decode(token, 'secret', algorithms=['HS256'])
    except:
        raise AuthenticationFailed('unauthed')
    user = User.objects.filter(id=payload['id']).first()
    return user

def login(user):
    payload = {
        'id': user.id,
        'username': user.username
    }
    token = jwt.encode(payload, 'secret', algorithm='HS256')
    response = Response()
    response.set_cookie(key='jwt', value=token, httponly=True)
    response.data = {'jwt': token}
    return response

def logout():
    response = Response()
    response.delete_cookie('jwt')
    response.data = {
        'message': 'Successfully logged out'
    }
    return response


class OrderView(APIView):

    def get(self, request):
        orders = Order.objects.filter(stat="available")
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data, status=200)

    def post(self, request):
        data = request.data
        data['price'] = float(data['price'])
        user = getUser(request)
        customer = Customer.objects.get(user=user)
        print(data)
        print(customer)
        serializer = OrderSerializer(data=data) # This will create an instance
        if serializer.is_valid():
            instance = serializer.save()
            instance.customer = customer
            instance.save()
            return Response(serializer.data, status=200)
        else:
            print(serializer.errors)
            return Response(serializer.errors)
    
    def put(self, request):
        data = request.data
        order = Order.objects.get(id=data['id'])
        driver = Driver.objects.get(user=getUser(request))
        print(data)
        if data['type'] == 'accept':
            order.stat = "unavailable"
            order.driver = driver
            order.save()
            serializer = CustomerSerializer(order.customer, many=False) # But here I do not want to send them their balance
            return Response(serializer.data)
        else:
            order.stat = "available"
            order.driver = None
            order.save()
            return Response(f"Order: {order.id} has been updated!")
    
    def delete(self, request):
        data = request.data
        order = Order.objects.get(id=data['id'])
        customer = order.customer
        customer.balance -= order.price
        driver = order.driver
        driver.balance += order.price
        customer.save()
        driver.save()
        order.delete()
        return Response(f"Order deleted", status=200)
    

class UserView(APIView):
        
    def post(self, request): # Account Creation
        form = request.data
        print(form)
        # Do some checking here
        user = User.objects.create_user(username=form['username'], password=form['password'], first_name=form['firstName'], last_name=form['lastName'], email=form['email'])
        user.save()
        if (form['type'] == 'Customer'):
            customer = Customer(user=user)
            customer.save()
        else:
            driver = Driver(user=user)
            driver.save()
        return Response(f"Account created!")

    def put(self, request): # Login
        form = request.data
        if form['cmd'] == 'login':
            user = authenticate(username=form['username'], password=form['password'])
            if user:
                return login(user)
            else:
                return Response(f"Something went Wrong!", status=404)
        elif form['cmd'] == 'location':
            user = getUser(request)
            # type has to be driver
            driver = Driver.objects.get(user=user)
            driver.lat = form['location']['latitude']
            driver.lon = form['location']['longitude']
            driver.save()
            print(driver, form['location'])
            serializer = DriverSerializer(driver,many=False)
            return Response(serializer.data)
        else:
            try:
                user = getUser(request)
                if user:
                    if form['type'] == 'Driver':
                        profile = Driver.objects.get(user=user)
                        serializer = DriverSerializer(profile, many=False)
                    elif form['type'] == 'Customer':
                        profile = Customer.objects.get(user=user)
                        serializer = CustomerSerializer(profile, many=False)
                    return Response(serializer.data, status=200)
                else:
                    Response("Unauth", status=500)
            except:
                return Response("Unauth", status=500)
            
        
    def delete(self, request): # Logout
        return logout()


class PingView(APIView):

    def get(self, request): # Only the customer does this
        user = getUser(request)
        customer = Customer.objects.get(user=user)
        order = Order.objects.filter(customer=customer) # This should never error because ping happens when a customer placed an order that belongs to them
        print(order)
        if len(order)>0:
            serializer = OrderSerializer(order[0], many=False)
            return Response(serializer.data)
        return Response("No order", status=404)
    
class Ping2View(APIView):

    def get(self, request):
        user = getUser(request)
        driver = Driver.objects.get(user=user)
        order = Order.objects.filter(driver=driver)
        if len(order)>0:
            serializer = OrderSerializer(order[0], many=False)
            return Response(serializer.data)
        return Response("No order", status=404)
    
class ChargeView(APIView):

    def post(self,request):
        customer = Customer.objects.get(user=getUser(request))
        stripeCustomer = stripe.Customer.create(email=customer.user.email)
        data = request.data
        session = stripe.checkout.Session.create(
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': f'${data["amount"]} credit',
                    },
                    'unit_amount_decimal': int(data["amount"])*100,
                },
                'quantity': 1,
            }],
            customer=stripeCustomer.id,
            mode = 'payment',
            success_url = 'http://google.com'
        )
        return Response({'url': session.url}, status=200)
    
class ChargeHook(APIView):
    
    def post(self, request):
        sig_header = request.headers['STRIPE_SIGNATURE']
        payload = request.data
        if payload['type'] == 'checkout.session.completed':
            customer = Customer.objects.get(user__email=payload['data']['object']['customer_details']['email'])
            customer.balance += Decimal(payload['data']['object']['amount_subtotal'] / 100)
            customer.save()
        return Response("Hi")
    
class PaymentIntentView(APIView):
    
    def post(self, request):
        data = request.data # amount
        print(data)
        driver = Driver.objects.get(user=getUser(request))
        stripeCustomer = stripe.Customer.create(email=driver.user.email)
        payment_intent = stripe.PaymentIntent.create(
            amount=data['amount'],
            currency='usd',
            customer=stripeCustomer,
            description="Payout"
        )
        return Response({'client_secret': payment_intent.client_secret})