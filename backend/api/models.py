from django.db import models
from django.contrib.auth.models import User
# Create your models here.

class Customer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    ppic = models.ImageField(blank=True, null=True)
    balance = models.DecimalField(decimal_places=2, max_digits=20, default=0)

    def __str__(self):
        return self.user.username



class Driver(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    ppic = models.ImageField(blank=True, null=True)
    balance = models.DecimalField(decimal_places=2, max_digits=20, default=0)
    lat = models.DecimalField(decimal_places=10, max_digits=20, blank=True, null=True)
    lon = models.DecimalField(decimal_places=10, max_digits=20, blank=True, null=True)

    def __str__(self):
        return self.user.username

class Order(models.Model):
    oLat = models.DecimalField(decimal_places=10, max_digits=20)
    oLon = models.DecimalField(decimal_places=10, max_digits=20)
    dLat = models.DecimalField(decimal_places=10, max_digits=20)
    dLon = models.DecimalField(decimal_places=10, max_digits=20)
    price = models.DecimalField(decimal_places=10, max_digits=20)
    stat = models.CharField(max_length=20, default='available') # Can be 'available', or 'unavailable'
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, blank=True, null=True)
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE, blank=True, null=True)

    def __str__(self):
        return f"Order: {self.id}"
    
