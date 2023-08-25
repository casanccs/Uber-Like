from django.db import models

# Create your models here.


class Order(models.Model):
    oLat = models.DecimalField(decimal_places=10, max_digits=20)
    oLon = models.DecimalField(decimal_places=10, max_digits=20)
    dLat = models.DecimalField(decimal_places=10, max_digits=20)
    dLon = models.DecimalField(decimal_places=10, max_digits=20)
    price = models.DecimalField(decimal_places=10, max_digits=20)
    stat = models.CharField(max_length=20, default='available') # Can be 'available', or 'unavailable'

    def __str__(self):
        return f"Order: {self.id}"