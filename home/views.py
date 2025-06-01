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

def personal_support(request):
    return render(request, 'home/personal_support.html')

def services_and_projects(request):
    return render(request, 'home/services_and_projects.html')

def business_support(request):
    return render(request, 'home/Business_support.html')

def task_tracker(request):
    return render(request, 'home/task_tracker.html')

def training_and_education(request):
    return render(request, 'home/training_and_education.html')