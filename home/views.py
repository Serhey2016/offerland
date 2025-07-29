# home/views.py

from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from PIL import Image
import json
import os
import uuid


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


def personal_support(request):
    return render(request, 'home/personal_support.html')

def services_and_projects(request):
    return render(request, 'home/services_and_projects.html')

def business_support(request):
    return render(request, 'home/Business_support.html')

def task_tracker(request):
    return render(request, 'home/task_tracker.html')

def contdowntimer(request):
    return render(request, 'home/contdowntimer.html')

def user_settings(request):
    return render(request, 'home/user_settings.html')

@login_required
def settings(request):
    """
    Страница настроек профиля пользователя.
    Доступна только для авторизованных пользователей.
    """
    context = {
        'title': 'Settings',
        'user': request.user,
        'user_avatar_url': request.user.avatar.url if request.user.avatar else None
    }
    return render(request, 'home/settings.html', context)

@login_required
@csrf_exempt
@require_http_methods(["POST"])
def upload_avatar(request):
    """
    Обработка загрузки аватара пользователя с оптимизацией изображения
    """
    try:
        if 'avatar' not in request.FILES:
            return JsonResponse({
                'success': False,
                'message': 'No file uploaded'
            }, status=400)
        
        uploaded_file = request.FILES['avatar']
        
        # Проверка размера файла (5MB)
        if uploaded_file.size > 5 * 1024 * 1024:
            return JsonResponse({
                'success': False,
                'message': 'File size must be less than 5MB'
            }, status=400)
        
        # Проверка типа файла
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
        if uploaded_file.content_type not in allowed_types:
            return JsonResponse({
                'success': False,
                'message': 'Only JPG, PNG and GIF files are allowed'
            }, status=400)
        
        # Удаляем старый аватар если он существует
        user = request.user
        if user.avatar:
            try:
                if os.path.exists(user.avatar.path):
                    os.remove(user.avatar.path)
            except:
                pass  # Игнорируем ошибки при удалении старого файла
        
        # Обрабатываем и оптимизируем изображение
        try:
            image = Image.open(uploaded_file)
            
            # Конвертируем в RGB если нужно
            if image.mode in ('RGBA', 'LA', 'P'):
                image = image.convert('RGB')
            
            # Изменяем размер если изображение слишком большое
            max_size = (400, 400)
            if image.size[0] > max_size[0] or image.size[1] > max_size[1]:
                image.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Генерируем уникальное имя файла
            file_extension = uploaded_file.name.split('.')[-1].lower()
            if file_extension not in ['jpg', 'jpeg', 'png', 'gif']:
                file_extension = 'jpg'
            
            filename = f"user_avatars/{user.id}_{uuid.uuid4().hex[:8]}.{file_extension}"
            
            # Сохраняем оптимизированное изображение
            from io import BytesIO
            buffer = BytesIO()
            image.save(buffer, format='JPEG', quality=85, optimize=True)
            buffer.seek(0)
            
            # Сохраняем в поле avatar пользователя
            user.avatar.save(filename, ContentFile(buffer.getvalue()), save=False)
            user.save()
            
        except Exception as img_error:
            # Если обработка изображения не удалась, сохраняем оригинал
            filename = f"user_avatars/{user.id}_{uuid.uuid4().hex[:8]}_{uploaded_file.name}"
            user.avatar.save(filename, uploaded_file, save=False)
            user.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Avatar uploaded successfully',
            'avatar_url': user.avatar.url if user.avatar else None
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error uploading file: {str(e)}'
        }, status=500)

@login_required
@csrf_exempt
@require_http_methods(["POST"])
def delete_avatar(request):
    """
    Удаление аватара пользователя
    """
    try:
        user = request.user
        
        # Удаляем файл если он существует
        if user.avatar:
            # Удаляем физический файл
            if os.path.exists(user.avatar.path):
                os.remove(user.avatar.path)
            
            # Очищаем поле в базе данных
            user.avatar = None
            user.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Avatar deleted successfully'
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error deleting avatar: {str(e)}'
        }, status=500)



