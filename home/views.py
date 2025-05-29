# home/views.py

from django.shortcuts import render



def index(request):
    context = {
        'title': 'Home',
        'content': 'Welcome to the home page.'
    }
    return render(request, 'home/home.html', context)

def about(request):
    context = {
        'title': 'About us',
        'content': 'About us'
    }
    return render(request, 'home/about.html', context)

def contacts(request):
    context = {
        'title': 'Our contacts',
        'content': 'Our contacts'
    }
    return render(request, 'home/contacts.html', context)

def testpage(request):
    return render(request, 'home/testpage.html', {'title': 'Test Page'})