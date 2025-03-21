from django import forms
from django_ckeditor_5.widgets import CKEditor5Widget  # Исправленный импорт [[3]][[9]]
from blog.models import AllArticles

class AllArticlesForm(forms.ModelForm):
    article_text = forms.CharField(widget=CKEditor5Widget(), label="Article Text")  # Исправленный виджет

    class Meta:
        model = AllArticles
        fields = ['theme', 'title_image', 'article_text', 'category', 'tags', 'is_published']