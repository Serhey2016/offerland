# home/views.py

from django.http import HttpResponse



def home(request):
    return HttpResponse("Welcome to the Home app! That is index page")