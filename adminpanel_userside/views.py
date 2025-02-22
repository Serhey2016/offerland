# adminpanel_userside/views.py

from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from .models import VacanciesFromBoards, WorklistStatuses
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt
from django.urls import reverse


@login_required(login_url='adminpanel_userside:login')
def control_panel_main_f(request):
    return render(request, 'adminpanel_userside/control_panel_main.html')

def vacancies_from_boards(request):
    vacancies = VacanciesFromBoards.objects.all()
    statuses = WorklistStatuses.objects.all()
    context = {
        'title': 'Vacancies from Boards',
        'vacancies': vacancies,
        'statuses': statuses,
        'update_vacancy_url': reverse('adminpanel_userside:update_vacancy'),  # Добавляем URL
    }
    return render(request, 'adminpanel_userside/vfromjboard.html', context)


@csrf_exempt
def update_vacancy(request):
    if request.method == 'POST':
        vacancy_id = request.POST.get('id')
        field = request.POST.get('field')

        try:
            vacancy = VacanciesFromBoards.objects.get(id=vacancy_id)
            if field == 'job_title':
                job_title = request.POST.get('job_title')
                job_title_link = request.POST.get('job_title_link')
                vacancy.job_title = job_title
                vacancy.job_title_link = job_title_link
            elif field == 'status':
                status_id = request.POST.get('status')
                if status_id:
                    vacancy.status_id = status_id
            vacancy.save()
            return JsonResponse({'success': True})
        except VacanciesFromBoards.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Vacancy not found'})
    return JsonResponse({'success': False, 'error': 'Invalid request method'})


def login_view(request):
    if request.method == 'POST':
        email = request.POST.get('username')  # Поле из формы называется 'username', но содержит email
        password = request.POST.get('password')
        user = authenticate(request, email=email, password=password)  # Используем email
        if user is not None and user.is_active:
            login(request, user)
            return redirect('adminpanel_userside:control_panel_main_f')
        else:
            messages.error(request, 'Invalid email or password.')
    
    # Отладка: проверка наличия сообщений
   
    return render(request, 'adminpanel_userside/login_form.html')


def register(request):
    if request.method == 'POST':
        username   = request.POST.get('username')
        first_name = request.POST.get('first_name')
        last_name  = request.POST.get('last_name')
        email      = request.POST.get('email')
        password   = request.POST.get('password')
        password_check = request.POST.get('PasswordCheck')

        if password != password_check:
            messages.error(request, "Пароли не совпадают.")
        else:
            User = get_user_model()
            if User.objects.filter(username=username).exists():
                messages.error(request, "Пользователь с таким username уже существует.")
            elif User.objects.filter(email=email).exists():
                messages.error(request, "Пользователь с таким email уже существует.")
            else:
                user = User.objects.create_user(username=username, email=email, password=password)
                user.first_name = first_name
                user.last_name = last_name
                user.save()
                messages.success(request, "Регистрация прошла успешно. Теперь вы можете авторизоваться.")
                return redirect('adminpanel_userside:login')
    return render(request, 'adminpanel_userside/register.html')