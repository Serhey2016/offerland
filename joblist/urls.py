# joblist/urls.py

from django.urls import path

from .views import jobdetails, joblisting
app_name = 'joblist'

# http://localhost:8000/joblist/joblisting/
urlpatterns = [

    path('jobdetails/<int:vacancy_id>/', jobdetails, name='jobdetails'),
    path('joblisting/', joblisting, name='joblisting'),

]




   # path('job/<int:job_id>/', views.detail, name='detail'),
   # path('category/<str:category_name>/', views.joblist, name='joblist_by_category'),
   # path('', views.joblist, name='joblist'),  # Додано цей шлях для /joblist/
    # path('vacancy_listing/', vacancy_listing, name='vacancy_listing'),  
    # path('jobs/', views.job_list, name='job_list'),
    # path('jobs/<int:id>/', views.job_details, name='job_details'), 