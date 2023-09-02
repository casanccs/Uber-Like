from django.contrib import admin
from django.urls import path, include
from .views import *

urlpatterns = [
    path('', TestView.as_view()),
    path('order/', OrderView.as_view()),
    path('user/', UserView.as_view()),
    path('ping/', PingView.as_view()),
    path('ping2/', Ping2View.as_view()),
]
