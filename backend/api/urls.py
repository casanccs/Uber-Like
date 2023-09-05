from django.contrib import admin
from django.urls import path, include
from .views import *

urlpatterns = [
    path('order/', OrderView.as_view()),
    path('user/', UserView.as_view()),
    path('ping/', PingView.as_view()),
    path('ping2/', Ping2View.as_view()),
    path('charge/', ChargeView.as_view()),
    path('webhook/', ChargeHook.as_view()),
    path('paymentIntent/', PaymentIntentView.as_view()),
]
