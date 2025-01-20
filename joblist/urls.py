# joblist/urls.py

from django.urls import path

from .views import jobdetails, joblisting

urlpatterns = [
   # path('job/<int:job_id>/', views.detail, name='detail'),
   # path('category/<str:category_name>/', views.joblist, name='joblist_by_category'),
   # path('', views.joblist, name='joblist'),  # Додано цей шлях для /joblist/
    path('jobdetails/', jobdetails, name='jobdetails'),
    path('joblisting/', joblisting, name='joblisting')
]