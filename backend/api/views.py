from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import *


class TestView(APIView):

    def get(self, request):
        return Response("Hi", status=200)

class OrderView(APIView):

    def get(self, request):
        orders = Order.objects.filter(stat="available")
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data, status=200)

    def post(self, request):
        data = request.data
        print(data)
        serializer = OrderSerializer(data=data) # This will create an instance
        serializer.is_valid()
        serializer.save()
        return Response("Recieved data", status=200)
    
    def put(self, request):
        data = request.data
        order = Order.objects.get(id=data['id'])
        if data['type'] == 'accept':
            order.stat = "unavailable"
        else:
            order.stat = "available"
        order.save()
        return Response(f"Order: {order.id} has been updated!")