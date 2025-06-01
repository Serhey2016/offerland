from django.urls import path
from .views import index, about, contacts
from . import views

app_name = 'home'

urlpatterns = [
    path('', index, name='index'),
    path('about/', about, name='about'),
    path('contacts/', contacts, name='contacts'),
    path('testpage/', views.testpage, name='testpage'),
    path('personal-support/', views.personal_support, name='personal_support'),
    path('services-and-projects/', views.services_and_projects, name='services_and_projects'),
    path('business-support/', views.business_support, name='business_support'),
    path('task-tracker/', views.task_tracker, name='task_tracker'),
    path('training-and-education/', views.training_and_education, name='training_and_education'),
]
