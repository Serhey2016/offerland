# config/urls.py

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('home.urls', namespace='home')),
    path('joblist/', include('joblist.urls')),
    path('blog/', include('blog.urls')),
    path('adminpanel_userside/', include('adminpanel_userside.urls')),
    path('ckeditor5/', include('django_ckeditor_5.urls')),  # Добавляем глобально
]