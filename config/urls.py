# config/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from django.urls import re_path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('home.urls', namespace='home')),
    path('joblist/', include('joblist.urls')),
    path('blog/', include('blog.urls')),
    path('accounts/', include('allauth.urls')),  # Добавьте эту строку
    path('adminpanel_userside/', include('adminpanel_userside.urls')),
    path('ckeditor5/', include('django_ckeditor_5.urls')),  # Добавляем глобально
    path('services_and_projects/', include('services_and_projects.urls')),
    path('task-tracker/', include('task_tracker.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    # Serve node_modules files for React development
    urlpatterns += [
        re_path(r'^node_modules/(?P<path>.*)$', serve, {'document_root': settings.BASE_DIR / 'node_modules'}),
    ]