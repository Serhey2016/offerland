
#config/urls.py

from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
     path('ckeditor/', include('ckeditor_uploader.urls')),
    path('', include('home.urls', namespace='home')),
    path('joblist/', include('joblist.urls')),
    path('blog/', include('blog.urls')),
    path('adminpanel_userside/', include('adminpanel_userside.urls')),
]
