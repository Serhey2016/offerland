from django.urls import path
from .views import testpage, save_task_notes, save_job_search_notes, add_job_search_activity, change_advertising_status, start_task, get_edit_data, remove_advertising_photo, user_tasks, user_inbox_items, update_task_status, update_category
from .forms import update_form
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
    path('update_form/', update_form, name='update_form'),
    path('get_edit_data/<str:form_type>/<slug:item_slug>/', get_edit_data, name='get_edit_data'),
    path('save_task_notes/<slug:task_slug>/', save_task_notes, name='save_task_notes'),
    path('save_job_search_notes/<int:job_search_id>/', save_job_search_notes, name='save_job_search_notes'),
    path('add_job_search_activity/<int:job_search_id>/', add_job_search_activity, name='add_job_search_activity'),
    path('create_activity_task/<int:activity_id>/', create_activity_task, name='create_activity_task'),
    path('start_job_search/<int:job_search_id>/', views.start_job_search, name='start_job_search'),
    path('start_task/<slug:task_slug>/', start_task, name='start_task'),
    path('change_advertising_status/<int:advertising_id>/', change_advertising_status, name='change_advertising_status'),
    path('remove_advertising_photo/<int:advertising_id>/<int:photo_id>/', remove_advertising_photo, name='remove_advertising_photo'),
    path('user_tasks/', user_tasks, name='user_tasks'),
    path('user_inbox_items/', user_inbox_items, name='user_inbox_items'),
    path('tasks/<slug:task_slug>/', update_task_status, name='update_task_status'),
    path('elements/<slug:slug>/position/', update_category, name='update_category'),
]