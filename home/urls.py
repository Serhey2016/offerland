from django.urls import path
from .views import index, about, contacts, settings, upload_avatar, delete_avatar, update_profile, update_phone, update_password, delete_account
from . import views

app_name = 'home'

urlpatterns = [
    path('', index, name='index'),
    path('about/', about, name='about'),
    path('contacts/', contacts, name='contacts'),
    path('settings/', settings, name='settings'),
    path('upload-avatar/', upload_avatar, name='upload_avatar'),
    path('delete-avatar/', delete_avatar, name='delete_avatar'),
    path('update-profile/', update_profile, name='update_profile'),
    path('update-phone/', update_phone, name='update_phone'),
    path('update-password/', update_password, name='update_password'),
    path('delete-account/', delete_account, name='delete_account'),


    path('personal-support/', views.personal_support, name='personal_support'),
    path('services-and-projects/', views.services_and_projects, name='services_and_projects'),
    path('business-support/', views.business_support, name='business_support'),
    path('contdowntimer/', views.contdowntimer, name='contdowntimer'),
    path('user_settings/', views.user_settings, name='user_settings'),
]
