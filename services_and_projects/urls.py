from django.urls import path
from .views import testpage, save_task_notes
from . import views
from services_and_projects.forms import create_task, create_advertising, create_time_slot, handle_form_submission

app_name = 'services_and_projects'

urlpatterns = [
    path('testpage/', views.testpage, name='testpage'),
    path('create_task/', create_task, name='create_task'),
    path('create_advertising/', create_advertising, name='create_advertising'),
    path('create_time_slot/', create_time_slot, name='create_time_slot'),
    path('submit_form/', handle_form_submission, name='submit_form'),
    path('save_task_notes/<int:task_id>/', save_task_notes, name='save_task_notes'),
]