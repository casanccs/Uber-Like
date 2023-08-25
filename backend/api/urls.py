from django.contrib import admin
from django.urls import path, include
from .views import *

urlpatterns = [
    path('', TestView.as_view()),
    path('order/', OrderView.as_view()),
]
