# joblist/urls.py

from django.urls import path
from . import views

urlpatterns = [
   path('job/<int:job_id>/', views.detail, name='detail'),
   path('category/<str:category_name>/', views.joblist, name='joblist_by_category'),
   path('', views.joblist, name='joblist'),  # Додано цей шлях для /joblist/
]