from django.shortcuts import render, redirect
from .models import Task, TypeOfTask, TaskStatus, Finance, ServicesCategory, Services, ServicesRelations, Advertising, TimeSlot
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from joblist.models import AllTags
from .models import (
    TaskHashtagRelations, AdvertisingHashtagRelations, TimeSlotHashtagRelations,
    PerformersRelations, CommentTaskRelations, ServicesRelations,
    TimeSlotPerformersRelations, CommentTimeSlotRelations,
    CommentAdvertisingRelations,
    PhotoRelations, Comment
)
from decimal import Decimal
import json

def none_if_empty(val):
    return val if val not in (None, '', 'None', 'null') else None

def create_task(request):
    if request.method == 'POST':
        try:
            User = get_user_model()
            # Получаем данные из формы
            type_of_task_id = none_if_empty(request.POST.get('type_of_task'))
            title = none_if_empty(request.POST.get('title'))
            description = none_if_empty(request.POST.get('description'))
            photo_link = none_if_empty(request.POST.get('photo_link') or request.POST.get('photos-link'))
            date_start = none_if_empty(request.POST.get('date_start') or request.POST.get('date1'))
            date_end = none_if_empty(request.POST.get('date_end') or request.POST.get('date2'))
            time_start = none_if_empty(request.POST.get('time_start') or request.POST.get('time1'))
            time_end = none_if_empty(request.POST.get('time_end') or request.POST.get('time2'))
            documents = none_if_empty(request.POST.get('documents'))
            status_id = none_if_empty(request.POST.get('status'))
            is_private = bool(request.POST.get('private'))
            disclose_name = bool(request.POST.get('disclose_name'))
            hidden = bool(request.POST.get('hidden'))
            is_published = False  # или по логике вашей кнопки
            note = none_if_empty(request.POST.get('note') or request.POST.get('comment'))
            finance_id = none_if_empty(request.POST.get('finance'))
            parent_id = none_if_empty(request.POST.get('parent') or request.POST.get('project-included'))
            category_id = none_if_empty(request.POST.get('category'))
            service_id = none_if_empty(request.POST.get('service'))

            # Валидация обязательных полей
            missing_fields = []
            if not title:
                missing_fields.append('Title')
            
            # Для задач типа "Job search" description не обязателен
            if not description and type_of_task_id:
                try:
                    type_of_task = TypeOfTask.objects.get(id=type_of_task_id)
                    if type_of_task.type_of_task_name != 'Job search':
                        missing_fields.append('Description')
                except TypeOfTask.DoesNotExist:
                    missing_fields.append('Description')
            elif not description:
                missing_fields.append('Description')
                
            if missing_fields:
                return JsonResponse({
                    'success': False,
                    'error': f"Please fill in the following required field(s): {', '.join(missing_fields)}."
                }, status=400)

            # ЭТАП 1: Создаём основную запись Task
            task = Task.objects.create(
                type_of_task_id=type_of_task_id,
                title=title,
                description=description,
                photo_link=photo_link,
                date_start=date_start,
                date_end=date_end,
                time_start=time_start,
                time_end=time_end,
                documents=documents,
                status_id=status_id,
                is_private=is_private,
                disclose_name=disclose_name,
                hidden=hidden,
                is_published=is_published,
                note=note,
                finance_id=finance_id,
                parent_id=parent_id
            )

            # ЭТАП 2: Добавляем связанные данные через промежуточные таблицы

            # Хэштеги
            hashtags_data = request.POST.get('hashtags')
            if hashtags_data:
                # Парсим строку с ID, разделенными запятыми
                hashtag_ids = [id.strip() for id in hashtags_data.split(',') if id.strip()]
                for tag_id in hashtag_ids:
                    try:
                        tag_obj = AllTags.objects.get(id=tag_id)
                        TaskHashtagRelations.objects.get_or_create(task=task, hashtag=tag_obj)
                    except AllTags.DoesNotExist:
                        pass

            # Сервисы
            if service_id:
                try:
                    service = Services.objects.get(id=service_id)
                    ServicesRelations.objects.get_or_create(task=task, service=service)
                except Services.DoesNotExist:
                    pass

            # Исполнители
            performers_data = request.POST.get('performers')
            if performers_data:
                try:
                    performers = json.loads(performers_data)
                    for performer_name in performers:
                        # Создаем или находим пользователя
                        user, created = User.objects.get_or_create(
                            username=performer_name,
                            defaults={'email': f'{performer_name}@example.com'}
                        )
                        PerformersRelations.objects.get_or_create(task=task, user=user)
                except json.JSONDecodeError:
                    pass

            # Комментарии
            comment_text = request.POST.get('comment')
            if comment_text:
                # Получаем текущего пользователя (заглушка)
                current_user = User.objects.first()  # В реальном приложении используйте request.user
                comment = Comment.objects.create(
                    author=current_user,
                    content=comment_text
                )
                CommentTaskRelations.objects.create(task=task, comment=comment)

            # Фотографии (если загружены файлы)
            photos = request.FILES.getlist('photos')
            if photos:
                for photo_file in photos:
                    photo_relation = PhotoRelations.objects.create(photo=photo_file)
                    task.photos.add(photo_relation)

            # Добавляем owner relation
            if request.user.is_authenticated:
                from .models import TaskOwnerRelations
                TaskOwnerRelations.objects.get_or_create(task=task, user=request.user)

            return JsonResponse({'success': True, 'type': 'task', 'id': task.id})
        except Exception as e:
            import traceback
            print('Error in create_task:', e)
            traceback.print_exc()
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    return JsonResponse({'error': 'Only POST allowed'}, status=405)

def create_advertising(request):
    if request.method == 'POST':
        try:
            User = get_user_model()
            # Добавляем логирование для отладки
            import logging
            logger = logging.getLogger(__name__)
            logger.info("create_advertising function called")
            
            # Защита от двойной отправки - проверяем уникальный идентификатор
            request_id = request.POST.get('request_id')
            if request_id:
                # Можно использовать кэш или сессию для отслеживания обработанных запросов
                from django.core.cache import cache
                cache_key = f"advertising_request_{request_id}"
                if cache.get(cache_key):
                    logger.warning(f"Duplicate request detected: {request_id}")
                    return JsonResponse({'success': False, 'error': 'Duplicate request'}, status=400)
                cache.set(cache_key, True, timeout=60)  # 60 секунд
                logger.info(f"Processing request with ID: {request_id}")
            
            # Получаем данные из формы для рекламы
            title = none_if_empty(request.POST.get('title'))
            description = none_if_empty(request.POST.get('description'))
            photo_link = none_if_empty(request.POST.get('photo_link') or request.POST.get('photos-link'))
            type_of_task_id = none_if_empty(request.POST.get('type_of_task'))
            service_id = none_if_empty(request.POST.get('service'))

            logger.info(f"Creating advertising with title: {title}")

            # Валидация обязательных полей (service_id не обязателен)
            missing_fields = []
            if not title:
                missing_fields.append('Title')
            if not description:
                missing_fields.append('Description')
            if missing_fields:
                return JsonResponse({
                    'success': False,
                    'error': f"Please fill in the following required field(s): {', '.join(missing_fields)}."
                }, status=400)

            # ЭТАП 1: Создаём основную запись Advertising
            advertising = Advertising.objects.create(
                title=title,
                description=description,
                type_of_task_id=type_of_task_id,
                services_id=service_id
            )
            
            logger.info(f"Advertising created with ID: {advertising.id}")

            # ЭТАП 2: Добавляем связанные данные

            # Хэштеги
            hashtags_data = request.POST.get('hashtags')
            if hashtags_data:
                # Парсим строку с ID, разделенными запятыми
                hashtag_ids = [id.strip() for id in hashtags_data.split(',') if id.strip()]
                for tag_id in hashtag_ids:
                    try:
                        tag_obj = AllTags.objects.get(id=tag_id)
                        AdvertisingHashtagRelations.objects.get_or_create(advertising=advertising, hashtag=tag_obj)
                    except AllTags.DoesNotExist:
                        pass



            # Комментарии
            comment_text = request.POST.get('comment')
            if comment_text:
                current_user = User.objects.first()
                comment = Comment.objects.create(
                    author=current_user,
                    content=comment_text
                )
                CommentAdvertisingRelations.objects.create(advertising=advertising, comment=comment)

            # Фотографии
            photos = request.FILES.getlist('photos')
            if photos:
                for photo_file in photos:
                    photo_relation = PhotoRelations.objects.create(photo=photo_file)
                    advertising.photos.add(photo_relation)

            # Добавляем owner relation
            if request.user.is_authenticated:
                from .models import AdvertisingOwnerRelations
                AdvertisingOwnerRelations.objects.get_or_create(advertising=advertising, user=request.user)

            logger.info(f"Advertising {advertising.id} completed successfully")
            return JsonResponse({'success': True, 'type': 'advertising', 'id': advertising.id})
        except Exception as e:
            import traceback
            print('Error in create_advertising:', e)
            traceback.print_exc()
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    return JsonResponse({'error': 'Only POST allowed'}, status=405)

def create_time_slot(request):
    if request.method == 'POST':
        try:
            User = get_user_model()
            # Получаем данные из формы для time slot
            date_start = none_if_empty(request.POST.get('date1'))
            date_end = none_if_empty(request.POST.get('date2'))
            time_start = none_if_empty(request.POST.get('time1'))
            time_end = none_if_empty(request.POST.get('time2'))
            reserved_time = none_if_empty(request.POST.get('reserved_time'))
            start_location = none_if_empty(request.POST.get('start_location'))
            cost_hour = none_if_empty(request.POST.get('cost_hour'))
            min_slot = none_if_empty(request.POST.get('min_slot'))
            type_of_task_id = none_if_empty(request.POST.get('type_of_task'))
            service_id = none_if_empty(request.POST.get('service'))

            # Валидация обязательных полей (service_id не обязателен)
            missing_fields = []
            if not date_start:
                missing_fields.append('Date start')
            if not date_end:
                missing_fields.append('Date end')
            if not time_start:
                missing_fields.append('Time start')
            if not time_end:
                missing_fields.append('Time end')
            if missing_fields:
                return JsonResponse({
                    'success': False,
                    'error': f"Please fill in the following required field(s): {', '.join(missing_fields)}."
                }, status=400)

            # Преобразуем cost_hour в центы (умножаем на 100)
            cost_in_cents = None
            if cost_hour:
                try:
                    cost_in_cents = Decimal(cost_hour) * 100
                except (ValueError, TypeError):
                    cost_in_cents = Decimal('0')

            # ЭТАП 1: Создаём основную запись TimeSlot
            time_slot = TimeSlot.objects.create(
                date_start=date_start,
                date_end=date_end,
                time_start=time_start,
                time_end=time_end,
                reserved_time_on_road=int(reserved_time) if reserved_time else 0,
                start_location=start_location or '',
                cost_of_1_hour_of_work=cost_in_cents or Decimal('0'),
                minimum_time_slot=str(min_slot) if min_slot else '',
                type_of_task_id=type_of_task_id,
                services_id=service_id
            )

            # ЭТАП 2: Добавляем связанные данные

            # Хэштеги
            hashtags_data = request.POST.get('ts-hashtags')
            if hashtags_data:
                # Парсим строку с названиями хэштегов, разделенными запятыми
                hashtag_names = [name.strip() for name in hashtags_data.split(',') if name.strip()]
                for tag_name in hashtag_names:
                    try:
                        # Ищем хэштег по названию или создаем новый
                        tag_obj, created = AllTags.objects.get_or_create(tag=tag_name)
                        TimeSlotHashtagRelations.objects.get_or_create(time_slot=time_slot, hashtag=tag_obj)
                    except Exception:
                        pass

            # Исполнители
            performers_data = request.POST.get('performers')
            if performers_data:
                try:
                    performers = json.loads(performers_data)
                    for performer_name in performers:
                        user, created = User.objects.get_or_create(
                            username=performer_name,
                            defaults={'email': f'{performer_name}@example.com'}
                        )
                        TimeSlotPerformersRelations.objects.get_or_create(time_slot=time_slot, user=user)
                except json.JSONDecodeError:
                    pass

            # Комментарии
            comment_text = request.POST.get('comment')
            if comment_text:
                current_user = User.objects.first()
                comment = Comment.objects.create(
                    author=current_user,
                    content=comment_text
                )
                CommentTimeSlotRelations.objects.create(time_slot=time_slot, comment=comment)

            # Фотографии
            photos = request.FILES.getlist('photos')
            if photos:
                for photo_file in photos:
                    photo_relation = PhotoRelations.objects.create(photo=photo_file)
                    time_slot.photos.add(photo_relation)

            # Добавляем owner relation
            if request.user.is_authenticated:
                from .models import TimeSlotOwnerRelations
                TimeSlotOwnerRelations.objects.get_or_create(time_slot=time_slot, user=request.user)

            return JsonResponse({'success': True, 'type': 'time_slot', 'id': time_slot.id})
        except Exception as e:
            import traceback
            print('Error in create_time_slot:', e)
            traceback.print_exc()
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    return JsonResponse({'error': 'Only POST allowed'}, status=405)

def handle_form_submission(request):
    """Универсальная функция для обработки всех типов форм"""
    if request.method == 'POST':
        try:
            # Добавляем логирование для отладки
            import logging
            logger = logging.getLogger(__name__)
            logger.info(f"handle_form_submission called with POST data: {dict(request.POST)}")
            
            # Определяем тип публикации
            type_of_task_id = request.POST.get('type_of_task')
            
            if not type_of_task_id:
                return JsonResponse({'success': False, 'error': 'Type of task is required'}, status=400)
            
            # Получаем объект TypeOfTask для определения типа
            try:
                type_of_task = TypeOfTask.objects.get(id=type_of_task_id)
                type_name = type_of_task.type_of_task_name.lower()
                logger.info(f"Type of task: {type_name}")
            except TypeOfTask.DoesNotExist:
                return JsonResponse({'success': False, 'error': 'Invalid type of task'}, status=400)
            
            # Направляем на соответствующую функцию в зависимости от типа
            # Учитываем возможную опечатку "adversting" вместо "advertising"
            if 'advertising' in type_name or 'adversting' in type_name:
                logger.info("Calling create_advertising")
                return create_advertising(request)
            elif 'time slot' in type_name or 'timeslot' in type_name:
                logger.info("Calling create_time_slot")
                return create_time_slot(request)
            else:
                # Для остальных типов (My list, Tender, Project) используем create_task
                logger.info("Calling create_task")
                return create_task(request)
                
        except Exception as e:
            import traceback
            print('Error in handle_form_submission:', e)
            traceback.print_exc()
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Only POST allowed'}, status=405)
