from django.urls import path
from .views import testpage
from . import views

app_name = 'services_and_projects'

urlpatterns = [
    path('testpage/', views.testpage, name='testpage'),

]