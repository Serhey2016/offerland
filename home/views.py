# home/views.py

from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from PIL import Image
from .utils import mask_email, mask_phone_number
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
        'user_avatar_url': request.user.avatar.url if request.user.avatar else None,
        'masked_email': mask_email(request.user.email),
        'masked_phone': mask_phone_number(request.user.phone_number) if request.user.phone_number else None
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


@login_required
@csrf_exempt
@require_http_methods(["POST"])
def update_profile(request):
    """
    Обновление профиля пользователя
    """
    try:
        user = request.user
        data = json.loads(request.body)
        
        # Обновляем основные поля
        if 'first_name' in data:
            user.first_name = data['first_name'].strip()
        
        if 'last_name' in data:
            user.last_name = data['last_name'].strip()
        
        # Обновляем UTR
        if 'utr' in data:
            utr = data['utr'].strip()
            if utr:
                # Проверяем формат UTR (10 цифр)
                if not utr.isdigit() or len(utr) != 10:
                    return JsonResponse({
                        'success': False,
                        'message': 'UTR must be exactly 10 digits'
                    }, status=400)
                user.utr = utr
            else:
                user.utr = ''
        
        # Обновляем информацию о компании
        if 'company_number' in data:
            company_number = data['company_number'].strip()
            if company_number:
                # Проверяем формат номера компании (8 цифр)
                if not company_number.isdigit() or len(company_number) != 8:
                    return JsonResponse({
                        'success': False,
                        'message': 'Company number must be exactly 8 digits'
                    }, status=400)
                user.company_number = company_number
            else:
                user.company_number = ''
        
        if 'company_name' in data:
            user.company_name = data['company_name'].strip()
        
        # Обновляем веб-сайт
        if 'website' in data:
            website = data['website'].strip()
            if website:
                # Проверяем формат URL
                if not website.startswith(('http://', 'https://')):
                    website = 'https://' + website
                user.website = website
            else:
                user.website = ''
        
        # Обновляем информацию о местоположении
        if 'country' in data:
            user.country = data['country']
        
        if 'postal_code' in data:
            user.postal_code = data['postal_code'].strip()
        
        if 'city' in data:
            user.city = data['city'].strip()
        
        # Сохраняем изменения
        user.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Profile updated successfully',
            'user_data': {
                'first_name': user.first_name,
                'last_name': user.last_name,
                'utr': user.utr,
                'company_number': user.company_number,
                'company_name': user.company_name,
                'website': user.website,
                'country': str(user.country) if user.country else '',
                'postal_code': user.postal_code,
                'city': user.city
            }
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error updating profile: {str(e)}'
        }, status=500)


@login_required
@csrf_exempt
@require_http_methods(["POST"])
def update_phone(request):
    """
    Обновление или добавление номера телефона пользователя без верификации
    """
    try:
        user = request.user
        data = json.loads(request.body)
        
        phone_number = data.get('phone_number', '').strip()
        
        # Validation
        if not phone_number:
            return JsonResponse({
                'success': False,
                'message': 'Phone number is required'
            }, status=400)
        
        # Phone format validation (basic international format)
        import re
        phone_regex = re.compile(r'^\+?[\d\s\-\(\)]{10,}$')
        if not phone_regex.match(phone_number):
            return JsonResponse({
                'success': False,
                'message': 'Please enter a valid phone number'
            }, status=400)
        
        # Update phone number
        user.phone_number = phone_number
        user.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Phone number updated successfully',
            'phone_number': user.phone_number
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error updating phone number: {str(e)}'
        }, status=500)


@login_required
@csrf_exempt
@require_http_methods(["POST"])
def update_password(request):
    """
    Обновление пароля пользователя с проверкой текущего пароля
    """
    try:
        user = request.user
        data = json.loads(request.body)
        
        current_password = data.get('currentPassword', '').strip()
        new_password = data.get('newPassword', '').strip()
        
        # Validation
        if not current_password or not new_password:
            return JsonResponse({
                'success': False,
                'message': 'Current password and new password are required'
            }, status=400)
        
        # Check if current password is correct
        if not user.check_password(current_password):
            return JsonResponse({
                'success': False,
                'message': 'Current password is incorrect'
            }, status=400)
        
        # Check if new password is different from current
        if current_password == new_password:
            return JsonResponse({
                'success': False,
                'message': 'New password must be different from current password'
            }, status=400)
        
        # Check password strength (basic validation)
        if len(new_password) < 8:
            return JsonResponse({
                'success': False,
                'message': 'Password must be at least 8 characters long'
            }, status=400)
        
        # Update password
        user.set_password(new_password)
        user.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Password updated successfully'
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error updating password: {str(e)}'
        }, status=500)



