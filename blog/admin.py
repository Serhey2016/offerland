from django.contrib import admin
from .models import BlogCategory, AllArticles

@admin.register(BlogCategory)
class BlogCategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)

@admin.register(AllArticles)
class AllArticlesAdmin(admin.ModelAdmin):
    list_display = ('id', 'theme', 'creator', 'created_date', 'published_date', 'is_published', 'category')
    list_filter = ('is_published', 'created_date', 'published_date', 'category')
    search_fields = ('theme', 'article_text')
    filter_horizontal = ('tags',)