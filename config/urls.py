# config/urls.py

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('home.urls', namespace='home')),
    path('joblist/', include('joblist.urls')),
    path('blog/', include('blog.urls')),
    path('accounts/', include('allauth.urls')),  # Добавьте эту строку
    path('adminpanel_userside/', include('adminpanel_userside.urls')),
    path('ckeditor5/', include('django_ckeditor_5.urls')),  # Добавляем глобально
    path('services_and_projects/', include('services_and_projects.urls')),
]