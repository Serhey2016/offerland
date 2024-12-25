#joblist/urls.py

from django.urls import path
from . import views  # Виправлено імпорт

urlpatterns = [
    path('job/<int:job_id>/', views.detail, name='detail'),
    path('category/<str:category_name>/', views.joblist, name='joblist_by_category'), # Виправлено назву змінної та уточнено назву
]