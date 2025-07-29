from django.urls import path
from .views import index, about, contacts, settings, upload_avatar, delete_avatar
from . import views

app_name = 'home'

urlpatterns = [
    path('', index, name='index'),
    path('about/', about, name='about'),
    path('contacts/', contacts, name='contacts'),
    path('settings/', settings, name='settings'),
    path('upload-avatar/', upload_avatar, name='upload_avatar'),
    path('delete-avatar/', delete_avatar, name='delete_avatar'),


    path('personal-support/', views.personal_support, name='personal_support'),
    path('services-and-projects/', views.services_and_projects, name='services_and_projects'),
    path('business-support/', views.business_support, name='business_support'),
    path('task-tracker/', views.task_tracker, name='task_tracker'),
    path('contdowntimer/', views.contdowntimer, name='contdowntimer'),
    path('user_settings/', views.user_settings, name='user_settings'),
]
