#adminpanel_userside/urls.py

from django.urls import path, include
from .views import control_panel_main_f, vacancies_from_boards, update_vacancy, login_view, register

app_name = 'adminpanel_userside'

urlpatterns = [
    path('', control_panel_main_f, name='control_panel_main_f'),
    path('vacancies_from_boards/', vacancies_from_boards, name='vacancies_from_boards'),
    path('update-vacancy/', update_vacancy, name='update_vacancy'),
    path('login/', login_view, name='login'),
    path('register/', register, name='register'),
]