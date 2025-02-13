# adminpanel_userside/views.py

from django.shortcuts import render

# Create your views here.
def control_panel_main_f(request):
    context = {
        'title': 'Admin Panel',
        'content': 'Admin Panel'
    }
    return render(request, 'adminpanel_userside/control_panel_main.html', context)

def vacancies_from_boards(request):
    context = {
        'title': 'vacancies_from_boards',
        'content': 'Admin Panel'
    }
    return render(request, 'adminpanel_userside/vfromjboard.html', context)