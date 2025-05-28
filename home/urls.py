from django.urls import path
from .views import index, about, contacts

app_name = 'home'

urlpatterns = [
    path('', index, name='index'),
    path('about/', about, name='about'),
    path('contacts/', contacts, name='contacts')
]
