# blog/views.py

from django.shortcuts import render

# Create your views here.
def about(request):
    context = {
        'title': 'About us',
        'content': 'About us'
    }
    return render(request, 'blog/about.html', context)