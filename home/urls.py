# home/urls.py

from django.urls import path
from .views import index  # Імпортуємо конкретну функцію представлення

app_name = 'home'


urlpatterns = [
    path('', index, name='index'),
]
