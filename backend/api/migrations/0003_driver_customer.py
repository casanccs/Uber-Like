# Generated by Django 4.1.7 on 2023-08-31 01:07

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('api', '0002_order_stat'),
    ]

    operations = [
        migrations.CreateModel(
            name='Driver',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ppic', models.ImageField(upload_to='')),
                ('balance', models.DecimalField(decimal_places=2, max_digits=20)),
                ('lat', models.DecimalField(decimal_places=10, max_digits=20)),
                ('lon', models.DecimalField(decimal_places=10, max_digits=20)),
                ('c_order', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='api.order')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Customer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ppic', models.ImageField(upload_to='')),
                ('balance', models.DecimalField(decimal_places=2, max_digits=20)),
                ('c_order', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='api.order')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]