from django.shortcuts import render, redirect
from .models import Task, TypeOfTask, TaskStatus, Finance, ServicesCategory, Services, ServicesRelations, Advertising, TimeSlot, JobSearch
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
            # Добавляем логирование для отладки
            import logging
            logger = logging.getLogger(__name__)
            logger.info("=== CREATE TASK START ===")
            logger.info(f"Request method: {request.method}")
            logger.info(f"Request user: {request.user}")
            logger.info(f"Request POST data: {dict(request.POST)}")
            
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
            if hashtags_data and hashtags_data.strip():
                try:
                    # Парсим JSON данные о хэштегах
                    hashtag_items = json.loads(hashtags_data)
                    logger.info(f"Parsed hashtag items for task: {hashtag_items}")
                    
                    for item in hashtag_items:
                        if item.get('type') == 'existing' and item.get('id'):
                            # Существующий тег с ID
                            try:
                                tag_obj = AllTags.objects.get(id=item['id'])
                                TaskHashtagRelations.objects.get_or_create(task=task, hashtag=tag_obj)
                            except AllTags.DoesNotExist:
                                pass
                                
                        elif item.get('type') == 'new' and item.get('name'):
                            # Новый тег без ID
                            tag_name = item['name'].strip()
                            if tag_name:
                                try:
                                    # Создаем новый тег или получаем существующий
                                    tag_obj, created = AllTags.objects.get_or_create(tag=tag_name)
                                    # Создаем связь с задачей
                                    TaskHashtagRelations.objects.get_or_create(task=task, hashtag=tag_obj)
                                except Exception as e:
                                    pass
                        else:
                            # Fallback для старого формата (просто ID через запятую)
                            try:
                                if isinstance(item, str) and item.strip().isdigit():
                                    tag_obj = AllTags.objects.get(id=item.strip())
                                    TaskHashtagRelations.objects.get_or_create(task=task, hashtag=tag_obj)
                            except (AllTags.DoesNotExist, ValueError):
                                pass
                                
                except json.JSONDecodeError:
                    # Fallback для старого формата
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

            logger.info(f"Task {task.id} completed successfully")
            logger.info("=== CREATE TASK COMPLETED ===")
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
            logger.info("=== CREATE ADVERTISING START ===")
            logger.info(f"Request method: {request.method}")
            logger.info(f"Request user: {request.user}")
            logger.info(f"Request POST data: {dict(request.POST)}")
            logger.info(f"Request FILES data: {dict(request.FILES)}")
            logger.info(f"Request headers: {dict(request.headers)}")
            
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

            logger.info(f"Parsed form data:")
            logger.info(f"  - title: {title}")
            logger.info(f"  - description: {description}")
            logger.info(f"  - photo_link: {photo_link}")
            logger.info(f"  - type_of_task_id: {type_of_task_id}")
            logger.info(f"  - service_id: {service_id}")

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
            logger.info(f"Hashtags data received: '{hashtags_data}'")
            logger.info(f"All POST data: {dict(request.POST)}")
            
            if hashtags_data and hashtags_data.strip():
                try:
                    # Парсим JSON данные о хэштегах
                    hashtag_items = json.loads(hashtags_data)
                    logger.info(f"Parsed hashtag items: {hashtag_items}")
                    
                    for item in hashtag_items:
                        if item.get('type') == 'existing' and item.get('id'):
                            # Существующий тег с ID
                            try:
                                tag_obj = AllTags.objects.get(id=item['id'])
                                logger.info(f"Found existing tag: {tag_obj.tag} (ID: {tag_obj.id})")
                                relation, created = AdvertisingHashtagRelations.objects.get_or_create(
                                    advertising=advertising, 
                                    hashtag=tag_obj
                                )
                                if created:
                                    logger.info(f"Created hashtag relation: {relation.id}")
                                else:
                                    logger.info(f"Hashtag relation already exists: {relation.id}")
                            except AllTags.DoesNotExist:
                                logger.warning(f"Tag with ID {item['id']} not found")
                                continue
                            except Exception as e:
                                logger.error(f"Error creating hashtag relation for tag {item['id']}: {e}")
                                
                        elif item.get('type') == 'new' and item.get('name'):
                            # Новый тег без ID
                            tag_name = item['name'].strip()
                            if tag_name:
                                try:
                                    # Создаем новый тег или получаем существующий
                                    tag_obj, created = AllTags.objects.get_or_create(tag=tag_name)
                                    if created:
                                        logger.info(f"Created new tag: {tag_obj.tag} (ID: {tag_obj.id})")
                                    else:
                                        logger.info(f"Found existing tag with same name: {tag_obj.tag} (ID: {tag_obj.id})")
                                    
                                    # Создаем связь с рекламой
                                    relation, created = AdvertisingHashtagRelations.objects.get_or_create(
                                        advertising=advertising, 
                                        hashtag=tag_obj
                                    )
                                    if created:
                                        logger.info(f"Created hashtag relation for new tag: {relation.id}")
                                    else:
                                        logger.info(f"Hashtag relation already exists for new tag: {relation.id}")
                                        
                                except Exception as e:
                                    logger.error(f"Error creating new tag '{tag_name}': {e}")
                                    continue
                        else:
                            logger.warning(f"Invalid hashtag item format: {item}")
                            
                    logger.info(f"Successfully processed {len(hashtag_items)} hashtag items")
                    
                except json.JSONDecodeError as e:
                    logger.error(f"Error parsing hashtags JSON: {e}")
                    logger.error(f"Raw hashtags data: {hashtags_data}")
                except Exception as e:
                    logger.error(f"Unexpected error processing hashtags: {e}")
            else:
                logger.warning("No hashtags data received or empty string")


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
            logger.info("=== CREATE ADVERTISING COMPLETED ===")
            return JsonResponse({'success': True, 'type': 'advertising', 'id': advertising.id})
        except Exception as e:
            import traceback
            logger.error(f"Error in create_advertising: {e}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            print('Error in create_advertising:', e)
            traceback.print_exc()
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    return JsonResponse({'error': 'Only POST allowed'}, status=405)

def create_time_slot(request):
    if request.method == 'POST':
        try:
            User = get_user_model()
            # Добавляем логирование для отладки
            import logging
            logger = logging.getLogger(__name__)
            logger.info("=== CREATE TIME SLOT START ===")
            logger.info(f"Request method: {request.method}")
            logger.info(f"Request user: {request.user}")
            logger.info(f"Request POST data: {dict(request.POST)}")
            
            # Получаем данные из формы для time slot
            logger.info("=== EXTRACTING FORM DATA ===")
            date_start = none_if_empty(request.POST.get('date_start'))
            logger.info(f"date_start: {date_start}")
            date_end = none_if_empty(request.POST.get('date_end'))
            logger.info(f"date_end: {date_end}")
            time_start = none_if_empty(request.POST.get('time_start'))
            logger.info(f"time_start: {time_start}")
            time_end = none_if_empty(request.POST.get('time_end'))
            logger.info(f"time_end: {time_end}")
            reserved_time_on_road = none_if_empty(request.POST.get('reserved_time_on_road'))
            logger.info(f"reserved_time_on_road: {reserved_time_on_road}")
            start_location = none_if_empty(request.POST.get('start_location'))
            logger.info(f"start_location: {start_location}")
            cost_of_1_hour_of_work = none_if_empty(request.POST.get('cost_of_1_hour_of_work'))
            logger.info(f"cost_of_1_hour_of_work: {cost_of_1_hour_of_work}")
            minimum_time_slot = none_if_empty(request.POST.get('minimum_time_slot'))
            logger.info(f"minimum_time_slot: {minimum_time_slot}")
            type_of_task_id = none_if_empty(request.POST.get('type_of_task'))
            logger.info(f"type_of_task_id: {type_of_task_id}")
            services_id = none_if_empty(request.POST.get('services'))
            logger.info(f"services_id: {services_id}")
            category_id = none_if_empty(request.POST.get('category'))
            logger.info(f"category_id: {category_id}")
            logger.info("=== END EXTRACTING FORM DATA ===")

            # Валидация обязательных полей
            logger.info("=== VALIDATING FIELDS ===")
            missing_fields = []
            if not category_id:
                missing_fields.append('Category')
                logger.warning("Category is missing")
            if not services_id:
                missing_fields.append('Service')
                logger.warning("Service is missing")
            if not date_start:
                missing_fields.append('Date start')
                logger.warning("Date start is missing")
            if not date_end:
                missing_fields.append('Date end')
                logger.warning("Date end is missing")
            if not time_start:
                missing_fields.append('Time start')
                logger.warning("Time start is missing")
            if not time_end:
                missing_fields.append('Time end')
                logger.warning("Time end is missing")
            if not reserved_time_on_road:
                missing_fields.append('Reserved time on road')
                logger.warning("Reserved time on road is missing")
            if not start_location:
                missing_fields.append('Start location')
                logger.warning("Start location is missing")
            if not cost_of_1_hour_of_work:
                missing_fields.append('Cost per hour')
                logger.warning("Cost per hour is missing")
            if not minimum_time_slot:
                missing_fields.append('Minimum slot')
                logger.warning("Minimum slot is missing")
            
            logger.info(f"Missing fields: {missing_fields}")
            
            if missing_fields:
                error_msg = f"Please fill in the following required field(s): {', '.join(missing_fields)}."
                logger.error(f"Validation failed: {error_msg}")
                return JsonResponse({
                    'success': False,
                    'error': error_msg
                }, status=400)
            
            logger.info("=== VALIDATION PASSED ===")

            # Преобразуем cost_of_1_hour_of_work в центы (умножаем на 100)
            cost_in_cents = None
            if cost_of_1_hour_of_work:
                try:
                    cost_in_cents = Decimal(cost_of_1_hour_of_work) * 100
                except (ValueError, TypeError):
                    cost_in_cents = Decimal('0')

            # ЭТАП 1: Создаём основную запись TimeSlot
            logger.info("=== CREATING TIMESLOT ===")
            logger.info(f"date_start: {date_start}")
            logger.info(f"date_end: {date_end}")
            logger.info(f"time_start: {time_start}")
            logger.info(f"time_end: {time_end}")
            logger.info(f"reserved_time_on_road: {reserved_time_on_road}")
            logger.info(f"start_location: {start_location}")
            logger.info(f"cost_of_1_hour_of_work: {cost_in_cents}")
            logger.info(f"minimum_time_slot: {minimum_time_slot}")
            logger.info(f"type_of_task_id: {type_of_task_id}")
            logger.info(f"services_id: {services_id}")
            
            time_slot = TimeSlot.objects.create(
                date_start=date_start,
                date_end=date_end,
                time_start=time_start,
                time_end=time_end,
                reserved_time_on_road=int(reserved_time_on_road) if reserved_time_on_road and str(reserved_time_on_road).isdigit() else 0,
                start_location=start_location or '',
                cost_of_1_hour_of_work=cost_in_cents or Decimal('0'),
                minimum_time_slot=str(minimum_time_slot) if minimum_time_slot else '60',
                type_of_task_id=type_of_task_id,
                services_id=services_id
            )
            
            logger.info(f"TimeSlot created successfully with ID: {time_slot.id}")
            logger.info("=== TIMESLOT CREATED ===")

            # ЭТАП 2: Добавляем связанные данные

            # Хэштеги
            hashtags_data = request.POST.get('hashtags')
            if hashtags_data and hashtags_data.strip():
                try:
                    # Парсим JSON данные о хэштегах
                    hashtag_items = json.loads(hashtags_data)
                    logger.info(f"Parsed hashtag items for time slot: {hashtag_items}")
                    
                    for item in hashtag_items:
                        if item.get('type') == 'existing' and item.get('id'):
                            # Существующий тег с ID
                            try:
                                tag_obj = AllTags.objects.get(id=item['id'])
                                TimeSlotHashtagRelations.objects.get_or_create(time_slot=time_slot, hashtag=tag_obj)
                            except AllTags.DoesNotExist:
                                pass
                                
                        elif item.get('type') == 'new' and item.get('name'):
                            # Новый тег без ID
                            tag_name = item['name'].strip()
                            if tag_name:
                                try:
                                    # Создаем новый тег или получаем существующий
                                    tag_obj, created = AllTags.objects.get_or_create(tag=tag_name)
                                    # Создаем связь с time slot
                                    TimeSlotHashtagRelations.objects.get_or_create(time_slot=time_slot, hashtag=tag_obj)
                                except Exception as e:
                                    pass
                        else:
                            # Fallback для старого формата (просто названия через запятую)
                            try:
                                if isinstance(item, str) and item.strip():
                                    tag_name = item.strip()
                                    tag_obj, created = AllTags.objects.get_or_create(tag=tag_name)
                                    TimeSlotHashtagRelations.objects.get_or_create(time_slot=time_slot, hashtag=tag_obj)
                            except Exception as e:
                                pass
                                
                except json.JSONDecodeError:
                    # Fallback для старого формата
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

            logger.info(f"Time slot {time_slot.id} completed successfully")
            logger.info("=== CREATE TIME SLOT COMPLETED ===")
            return JsonResponse({'success': True, 'type': 'time_slot', 'id': time_slot.id})
        except Exception as e:
            import traceback
            logger.error(f"Error in create_time_slot: {e}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            print('Error in create_time_slot:', e)
            traceback.print_exc()
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    return JsonResponse({'error': 'Only POST allowed'}, status=405)

def create_job_search(request):
    """Создание записи Job Search"""
    if request.method == 'POST':
        try:
            # Добавляем логирование для отладки
            import logging
            logger = logging.getLogger(__name__)
            logger.info("=== CREATE JOB SEARCH START ===")
            logger.info(f"Request method: {request.method}")
            logger.info(f"Request user: {request.user}")
            logger.info(f"Request POST data: {dict(request.POST)}")
            
            # Получаем данные из формы
            title = request.POST.get('title', '').strip()
            
            if not title:
                return JsonResponse({
                    'success': False,
                    'error': 'Title is required'
                }, status=400)
            
            # Всегда создаем новую запись JobSearch
            job_search = JobSearch.objects.create(
                user=request.user,
                title=title
                # start_date остается пустым
                # last_update заполнится автоматически
            )
            logger.info(f"Created new JobSearch {job_search.id}")
            
            logger.info("=== CREATE JOB SEARCH COMPLETED ===")
            return JsonResponse({'success': True, 'type': 'job_search', 'id': job_search.id})
            
        except Exception as e:
            import traceback
            logger.error(f"Error in create_job_search: {e}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            print('Error in create_job_search:', e)
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
            logger.info("=== HANDLE FORM SUBMISSION START ===")
            logger.info(f"Request method: {request.method}")
            logger.info(f"Request user: {request.user}")
            logger.info(f"Request POST data: {dict(request.POST)}")
            logger.info(f"Request FILES data: {dict(request.FILES)}")
            logger.info(f"Request headers: {dict(request.headers)}")
            
            # Определяем тип публикации
            type_of_task_id = request.POST.get('type_of_task')
            logger.info(f"Received type_of_task_id: {type_of_task_id}")
            
            if not type_of_task_id:
                logger.error("Type of task is required but not provided")
                return JsonResponse({'success': False, 'error': 'Type of task is required'}, status=400)
            
            # Получаем объект TypeOfTask для определения типа
            try:
                type_of_task = TypeOfTask.objects.get(id=type_of_task_id)
                type_name = type_of_task.type_of_task_name.lower()
                logger.info(f"Type of task: {type_name} (ID: {type_of_task_id})")
                logger.info(f"Type name contains 'time slot': {'time slot' in type_name}")
                logger.info(f"Type name contains 'timeslot': {'timeslot' in type_name}")
            except TypeOfTask.DoesNotExist:
                logger.error(f"Invalid type of task ID: {type_of_task_id}")
                return JsonResponse({'success': False, 'error': 'Invalid type of task'}, status=400)
            
            # Направляем на соответствующую функцию в зависимости от типа
            # Учитываем возможную опечатку "adversting" вместо "advertising"
            if 'advertising' in type_name or 'adversting' in type_name:
                logger.info("Calling create_advertising")
                return create_advertising(request)
            elif 'time slot' in type_name or 'timeslot' in type_name or 'time' in type_name:
                logger.info("Calling create_time_slot")
                return create_time_slot(request)
            elif 'job search' in type_name:
                logger.info("Calling create_job_search")
                return create_job_search(request)
            elif type_of_task_id == '5':  # Принудительно для TimeSlot
                logger.info(f"Type ID is 5, forcing create_time_slot call")
                return create_time_slot(request)
            else:
                # Для остальных типов (My list, Tender, Project) используем create_task
                logger.info(f"Type '{type_name}' not recognized, calling create_task")
                return create_task(request)
                
        except Exception as e:
            import traceback
            logger.error(f"Error in handle_form_submission: {e}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            print('Error in handle_form_submission:', e)
            traceback.print_exc()
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    
    logger.error("Only POST method allowed")
    return JsonResponse({'error': 'Only POST allowed'}, status=405)

def create_activity_task(request, activity_id):
    """Создание новой таски для активности"""
    print(f"=== CREATE ACTIVITY TASK DEBUG ===")
    print(f"Request method: {request.method}")
    print(f"Activity ID: {activity_id}")
    print(f"Request user: {request.user}")
    print(f"Request POST data: {dict(request.POST)}")
    print(f"Request headers: {dict(request.headers)}")
    
    if request.method == 'POST':
        try:
            from .models import Activities, ActivitiesTaskRelations, Task, TaskStatus, JobSearchActivitiesRelations, TypeOfTask
            
            # Получаем активность
            activity = Activities.objects.get(id=activity_id)
            
            # Проверяем, что пользователь имеет доступ к активности
            # (через связь с JobSearch)
            try:
                # Получаем связь с JobSearch через промежуточную таблицу
                job_search_relation = JobSearchActivitiesRelations.objects.get(activity=activity)
                job_search = job_search_relation.job_search
                
                # Проверяем права доступа
                if job_search.user != request.user:
                    return JsonResponse({
                        'success': False,
                        'error': 'You do not have permission to create task for this activity'
                    }, status=403)
                    
            except JobSearchActivitiesRelations.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'error': 'Activity not found or not linked to job search'
                }, status=404)
            
            # Получаем данные из формы
            title = request.POST.get('title', '').strip()
            description = request.POST.get('description', '').strip()
            
            # Валидация обязательных полей
            if not title:
                return JsonResponse({
                    'success': False,
                    'error': 'Title is required'
                }, status=400)
            
            # Получаем тип задачи по умолчанию (Job search) или создаем новый
            type_of_task, created = TypeOfTask.objects.get_or_create(
                type_of_task_name='Job search'
            )
            print(f"Type of task: {type_of_task} (created: {created})")
            
            # Получаем статус задачи по умолчанию
            default_status, created = TaskStatus.objects.get_or_create(
                name='Saved (inbox)'
            )
            print(f"Default status: {default_status} (created: {created})")
            
            # Создаем таску
            print(f"Creating task with title: {title}, description: {description}")
            task = Task.objects.create(
                type_of_task=type_of_task,
                title=title,
                description=description,
                status=default_status,
                is_private=False,
                disclose_name=False,
                hidden=False,
                is_published=False
            )
            print(f"Task created successfully with ID: {task.id}")
            
            # Связываем таску с активностью
            print(f"Creating ActivitiesTaskRelations for activity {activity.id} and task {task.id}")
            ActivitiesTaskRelations.objects.create(
                activity=activity,
                task=task
            )
            print(f"ActivitiesTaskRelations created successfully")
            
            return JsonResponse({
                'success': True,
                'task_id': task.id,
                'task_title': task.title,
                'task_description': task.description,
                'task_updated_at': task.updated_at.strftime('%d.%m.%Y'),
                'message': 'Task created successfully'
            })
            
        except Activities.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Activity not found'
            }, status=404)
        except JobSearchActivitiesRelations.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Activity not linked to any job search'
            }, status=404)
        except Exception as e:
            import traceback
            print(f"Error in create_activity_task: {e}")
            print(f"Traceback: {traceback.format_exc()}")
            # Log to Django logger if available
            try:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error in create_activity_task: {e}")
                logger.error(f"Traceback: {traceback.format_exc()}")
            except:
                pass
            return JsonResponse({
                'success': False,
                'error': f'Error creating task: {str(e)}'
            }, status=500)
    
    return JsonResponse({'error': 'Only POST allowed'}, status=405)
