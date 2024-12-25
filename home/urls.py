# home/urls.py

from django.urls import path
from .views import home  # Імпортуємо конкретну функцію представлення

urlpatterns = [
    path('', home, name='home'),
]