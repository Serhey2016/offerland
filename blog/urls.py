# blog/urls.py

from django.urls import path
from . import views
from .views import about

urlpatterns = [
    # path('', views.blog_list, name='blog_list'),
    # path('<int:post_id>/', views.blog_detail, name='blog_detail'),
    # path('category/<str:category_name>/', views.blog_list_by_category, name='blog_list_by_category'),
    # path('tag/<str:tag_name>/', views.blog_list_by_tag, name='blog_list_by_tag'),
    path('about/', about, name='about')
]