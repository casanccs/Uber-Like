# Generated by Django 4.1.7 on 2023-08-31 04:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_order_customer_order_driver'),
    ]

    operations = [
        migrations.AlterField(
            model_name='driver',
            name='ppic',
            field=models.ImageField(blank=True, null=True, upload_to=''),
        ),
    ]