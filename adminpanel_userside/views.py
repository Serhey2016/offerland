# adminpanel_userside/views.py

from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from .models import VacanciesFromBoards
from django.contrib import messages

def toastr(request):
    return render(request, 'adminpanel_userside/toastr.html')


def control_panel_main_f(request):
    return render(request, 'adminpanel_userside/control_panel_main.html')

def vacancies_from_boards(request):
    vacancies = VacanciesFromBoards.objects.all()
    context = {
        'title': 'Vacancies from Boards',
        'vacancies': vacancies,
    }
    return render(request, 'adminpanel_userside/vfromjboard.html', context)


# @csrf_exempt
def update_vacancy(request):
    if request.method == 'POST':
        vacancy_id = request.POST.get('id')
        job_title = request.POST.get('job_title')
        job_title_link = request.POST.get('job_title_link')

        try:
            vacancy = VacanciesFromBoards.objects.get(id=vacancy_id)
            vacancy.job_title = job_title
            vacancy.job_title_link = job_title_link
            vacancy.save()
            return JsonResponse({'success': True})
        except VacanciesFromBoards.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Vacancy not found'})
    return JsonResponse({'success': False, 'error': 'Invalid request method'})

def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        # Проверка аутентификации пользователя
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)  # Авторизация пользователя
            return redirect('adminpanel_userside:control_panel_main_f')  # Перенаправление на главную страницу
        else:
            messages.error(request, 'Invalid username or password.')  # Сообщение об ошибке

    return render(request, 'adminpanel_userside/login_form.html')