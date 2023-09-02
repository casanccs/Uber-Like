from rest_framework.serializers import ModelSerializer
from .models import *



class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name']


class DriverSerializer(ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Driver
        fields = '__all__'

class CustomerSerializer(ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Customer
        fields = '__all__'


class OrderSerializer(ModelSerializer):
    customer = CustomerSerializer(required=False)
    driver = DriverSerializer(required=False)

    class Meta:
        model = Order
        fields = '__all__'