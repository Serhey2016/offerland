# adminpanel_userside/urls.py

from django.urls import path

from .views import control_panel_main_f
app_name = 'adminpanel_userside'

# http://localhost:8000/adminpanel1/jcontrol_panel_main_f/
urlpatterns = [
    path('', control_panel_main_f, name='control_panel_main_f'),
]


