# adminpanel_userside/urls.py

from django.urls import path
from .views import (
    control_panel_main_f, vacancies_from_boards, update_vacancy,
    login_view, register, articles_page, edit_article, create_article
)
from django.conf import settings
from django.conf.urls.static import static
from allauth.account.views import LoginView


app_name = 'adminpanel_userside'

urlpatterns = [
    path('', control_panel_main_f, name='control_panel_main_f'),
    path('vacancies_from_boards/', vacancies_from_boards, name='vacancies_from_boards'),
    path('update-vacancy/', update_vacancy, name='update_vacancy'),
    path('login/', LoginView.as_view(), name='login'),
    path('register/', register, name='register'),
    path('articles/', articles_page, name='articles_page'),
    
    path('edit_article/<int:article_id>/', edit_article, name='edit_article'),
    path('create_article/', create_article, name='create_article'),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

