from django.urls import path
from .views import testpage, save_task_notes, save_job_search_notes, add_job_search_activity, change_advertising_status
from . import views
from services_and_projects.forms import create_task, create_advertising, create_time_slot, create_job_search, handle_form_submission, create_activity_task

app_name = 'services_and_projects'

urlpatterns = [
    path('testpage/', views.testpage, name='testpage'),
    path('create_task/', create_task, name='create_task'),
    path('create_advertising/', create_advertising, name='create_advertising'),
    path('create_time_slot/', create_time_slot, name='create_time_slot'),
    path('create_job_search/', create_job_search, name='create_job_search'),
    path('submit_form/', handle_form_submission, name='submit_form'),
    path('save_task_notes/<int:task_id>/', save_task_notes, name='save_task_notes'),
    path('save_job_search_notes/<int:job_search_id>/', save_job_search_notes, name='save_job_search_notes'),
    path('add_job_search_activity/<int:job_search_id>/', add_job_search_activity, name='add_job_search_activity'),
    path('create_activity_task/<int:activity_id>/', create_activity_task, name='create_activity_task'),
    path('start_job_search/<int:job_search_id>/', views.start_job_search, name='start_job_search'),
    path('change_advertising_status/<int:advertising_id>/', change_advertising_status, name='change_advertising_status'),
]