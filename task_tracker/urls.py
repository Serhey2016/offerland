from django.urls import path
from . import views

app_name = 'task_tracker'

urlpatterns = [
    # Traditional Django views
    path('', views.index, name='index'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('dashboard-traditional/', views.dashboard_traditional, name='dashboard_traditional'),
    path('tasks/', views.task_list, name='task_list'),
    path('tasks/create/', views.task_create, name='task_create'),
    path('tasks/<int:task_id>/', views.task_detail, name='task_detail'),
    path('tasks/<int:task_id>/edit/', views.task_edit, name='task_edit'),
    path('tasks/<int:task_id>/delete/', views.task_delete, name='task_delete'),
    
    # API endpoints for React frontend
    path('api/tasks/', views.api_tasks, name='api_tasks'),
    path('api/tasks/<int:task_id>/', views.api_task_detail, name='api_task_detail'),
    path('api/tasks/create/', views.api_create_task, name='api_create_task'),
    path('api/tasks/<int:task_id>/update/', views.api_update_task, name='api_update_task'),
    path('api/tasks/<int:task_id>/delete/', views.api_delete_task, name='api_delete_task'),
    path('api/dashboard/stats/', views.api_dashboard_stats, name='api_dashboard_stats'),
]
