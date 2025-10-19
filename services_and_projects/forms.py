from django.shortcuts import render, redirect
from .models import Task, TaskStatus, Finance, ServicesCategory, Services, ServicesRelations, Advertising, TimeSlot, JobSearch
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from joblist.models import AllTags
from .models import (
    TaskHashtagRelations, AdvertisingHashtagRelations, TimeSlotHashtagRelations,
    PerformersRelations, CommentTaskRelations, ServicesRelations,
    TimeSlotPerformersRelations, CommentTimeSlotRelations,
    CommentAdvertisingRelations,
    PhotoRelations, Comment, AdvertisingOwnerRelations,
    TaskOwnerRelations, TimeSlotOwnerRelations
)
from decimal import Decimal
import json

def none_if_empty(val):
    return val if val not in (None, '', 'None', 'null') else None

@csrf_exempt
def create_task(request):
    if request.method == 'POST':
        # Check if user is authenticated
        if not request.user.is_authenticated:
            return JsonResponse({
                'success': False,
                'error': 'Authentication required'
            }, status=401)
            
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
            type_of_task_id = none_if_empty(request.POST.get('type_of_view'))
            if isinstance(type_of_task_id, list):
                type_of_task_id = type_of_task_id[0] if type_of_task_id else None
            title = none_if_empty(request.POST.get('title'))
            if isinstance(title, list):
                title = title[0] if title else None
            description = none_if_empty(request.POST.get('description'))
            if isinstance(description, list):
                description = description[0] if description else None
            photo_link = none_if_empty(request.POST.get('photo_link') or request.POST.get('photos-link'))
            # Handle datetime fields - combine date and time if provided
            start_datetime = None
            end_datetime = None
            
            # Start datetime
            date_start = none_if_empty(request.POST.get('date_start') or request.POST.get('date1'))
            time_start = none_if_empty(request.POST.get('time_start') or request.POST.get('time1'))
            if date_start and time_start:
                from datetime import datetime
                try:
                    start_datetime = datetime.strptime(f"{date_start} {time_start}", "%Y-%m-%d %H:%M")
                except ValueError:
                    try:
                        start_datetime = datetime.strptime(f"{date_start} {time_start}", "%d.%m.%Y %H:%M")
                    except ValueError:
                        pass
            elif date_start:
                from datetime import datetime
                try:
                    start_datetime = datetime.strptime(date_start, "%Y-%m-%d")
                except ValueError:
                    try:
                        start_datetime = datetime.strptime(date_start, "%d.%m.%Y")
                    except ValueError:
                        pass
            
            # End datetime
            date_end = none_if_empty(request.POST.get('date_end') or request.POST.get('date2'))
            time_end = none_if_empty(request.POST.get('time_end') or request.POST.get('time2'))
            if date_end and time_end:
                from datetime import datetime
                try:
                    end_datetime = datetime.strptime(f"{date_end} {time_end}", "%Y-%m-%d %H:%M")
                except ValueError:
                    try:
                        end_datetime = datetime.strptime(f"{date_end} {time_end}", "%d.%m.%Y %H:%M")
                    except ValueError:
                        pass
            elif date_end:
                from datetime import datetime
                try:
                    end_datetime = datetime.strptime(date_end, "%Y-%m-%d")
                except ValueError:
                    try:
                        end_datetime = datetime.strptime(date_end, "%d.%m.%Y")
                    except ValueError:
                        pass
            documents = none_if_empty(request.POST.get('documents'))
            # Set element_position - all new items go to inbox by default
            element_position = none_if_empty(request.POST.get('element_position'))
            if not element_position:
                element_position = 'inbox'
            is_private = bool(request.POST.get('private'))
            disclose_name = bool(request.POST.get('disclose_name'))
            hidden = bool(request.POST.get('hidden'))
            is_published = False  # или по логике вашей кнопки
            is_touchpoint = bool(request.POST.get('is_touchpoint'))
            note = none_if_empty(request.POST.get('note') or request.POST.get('comment'))
            finance_id = none_if_empty(request.POST.get('finance'))
            parent_id = none_if_empty(request.POST.get('parent') or request.POST.get('project-included'))
            priority = none_if_empty(request.POST.get('priority'))
            category_id = none_if_empty(request.POST.get('category'))
            service_id = none_if_empty(request.POST.get('service'))

            # Валидация обязательных полей
            missing_fields = []
            if not title:
                missing_fields.append('Title')
            
            # Для задач типа "Job search", "Task" (Inbox tasks) и "Project" description не обязателен
            if not description and type_of_task_id:
                try:
                    # type_of_task_id is now a string value, not an ID
                    # Check if it's not in the list of types where description is optional
                    if type_of_task_id not in ['job_search', 'task', 'project']:
                        missing_fields.append('Description')
                except Exception:
                    missing_fields.append('Description')
            # If no type_of_task_id provided (Inbox tasks), description is optional
                
            if missing_fields:
                return JsonResponse({
                    'success': False,
                    'error': f"Please fill in the following required field(s): {', '.join(missing_fields)}."
                }, status=400)

            # ЭТАП 1: Создаём основную запись Task
            task = Task.objects.create(
                type_of_view_id=type_of_task_id if type_of_task_id else 'task',
                title=title,
                description=description,
                photo_link=photo_link,
                start_datetime=start_datetime,
                end_datetime=end_datetime,
                documents=documents,
                priority=priority,
                element_position_id=element_position,
                is_private=is_private,
                disclose_name=disclose_name,
                hidden=hidden,
                is_published=is_published,
                is_touchpoint=is_touchpoint,
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
            type_of_task_id = none_if_empty(request.POST.get('type_of_view'))
            service_id = none_if_empty(request.POST.get('service'))

            logger.info(f"Parsed form data:")
            logger.info(f"  - title: {title}")
            logger.info(f"  - description: {description}")
            logger.info(f"  - photo_link: {photo_link}")
            logger.info(f"  - type_of_task_id: {type_of_task_id}")
            logger.info(f"  - service_id: {service_id}")

            logger.info(f"Creating advertising with title: {title}")

            # Валидация обязательных полей (только title обязателен)
            missing_fields = []
            if not title:
                missing_fields.append('Title')
            if missing_fields:
                return JsonResponse({
                    'success': False,
                    'error': f"Please fill in the following required field(s): {', '.join(missing_fields)}."
                }, status=400)

            # ЭТАП 1: Создаём основную запись Advertising
            advertising = Advertising.objects.create(
                title=title,
                description=description,
                type_of_view_id=type_of_task_id if type_of_task_id else 'advertising',
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
            type_of_task = none_if_empty(request.POST.get('type_of_view'))
            logger.info(f"type_of_task: {type_of_task}")
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
            logger.info(f"type_of_task: {type_of_task}")
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
                type_of_view_id=type_of_task or 'task',
                services_id=services_id,
                element_position_id='inbox'
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
            
            # Get detailed error message with traceback
            error_details = f"{str(e)}\n\nDetails: {traceback.format_exc()}"
            return JsonResponse({
                'success': False, 
                'error': str(e),
                'traceback': traceback.format_exc()
            }, status=500)
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
                title=title,
                element_position_id='projects'
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
            type_of_task_id = request.POST.get('type_of_view')
            logger.info(f"Received type_of_task_id: {type_of_task_id}")
            
            if not type_of_task_id:
                logger.error("Type of task is required but not provided")
                return JsonResponse({'success': False, 'error': 'Type of task is required'}, status=400)
            
            # type_of_task_id is now a string value directly
            type_name = type_of_task_id.lower() if type_of_task_id else ''
            logger.info(f"Type of task: {type_name}")
            logger.info(f"Type name contains 'time slot': {'time slot' in type_name}")
            logger.info(f"Type name contains 'timeslot': {'timeslot' in type_name}")
            
            # Направляем на соответствующую функцию в зависимости от типа
            # Учитываем возможную опечатку "adversting" вместо "advertising"
            if 'advertising' in type_name or 'adversting' in type_name:
                logger.info("Calling create_advertising")
                return create_advertising(request)
            elif 'time slot' in type_name or 'timeslot' in type_name or 'time' in type_name:
                logger.info("Calling create_time_slot")
                return create_time_slot(request)
            elif 'job' in type_name and 'search' in type_name:
                logger.info("Calling create_job_search")
                return create_job_search(request)
            elif type_of_task_id == 'orders':  # Orders is also a time slot
                logger.info(f"Type is orders, calling create_time_slot")
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
            from .models import Activities, ActivitiesTaskRelations, Task, TaskStatus, JobSearchActivitiesRelations
            
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
            
            # Тип задачи по умолчанию - 'job_search'
            type_of_task = 'job_search'
            print(f"Type of task: {type_of_task}")
            
            # Element position по умолчанию
            default_element_position = 'inbox'
            print(f"Default element_position: {default_element_position}")
            
            # Создаем таску
            print(f"Creating task with title: {title}, description: {description}")
            task = Task.objects.create(
                type_of_view_id=type_of_task,
                title=title,
                description=description,
                element_position_id=default_element_position,
                is_private=False,
                disclose_name=False,
                hidden=False,
                is_published=False,
                is_touchpoint=False
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

def update_form(request):
    """Универсальная функция для обновления всех типов форм"""
    if request.method == 'POST':
        try:
            import logging
            logger = logging.getLogger(__name__)
            logger.info("=== UPDATE FORM START ===")
            logger.info(f"Request method: {request.method}")
            logger.info(f"Request user: {request.user}")
            logger.info(f"Request POST data: {dict(request.POST)}")
            logger.info(f"Request FILES: {dict(request.FILES)}")
            
            # Получаем ID редактируемого элемента
            edit_item_id = request.POST.get('edit_item_id')
            type_of_task_id = request.POST.get('type_of_view')
            
            logger.info(f"Edit item ID: {edit_item_id}")
            logger.info(f"Type of task ID: {type_of_task_id}")
            
            if not edit_item_id:
                logger.error("Edit item ID is missing")
                return JsonResponse({'success': False, 'error': 'Edit item ID is required'}, status=400)
            
            if not type_of_task_id:
                logger.error("Type of task ID is missing")
                return JsonResponse({'success': False, 'error': 'Type of task is required'}, status=400)
            
            # Определяем тип публикации (теперь type_of_task_id - это строковое значение)
            type_name = type_of_task_id.lower() if type_of_task_id else ''
            logger.info(f"Type of task: {type_name}")
            logger.info(f"Updating {type_name} with ID: {edit_item_id}")
            
            # Направляем на соответствующую функцию обновления
            logger.info(f"Routing to update function for type: {type_name}")
            if 'advertising' in type_name:
                logger.info("Routing to update_advertising")
                return update_advertising(request, edit_item_id)
            elif 'time slot' in type_name or 'timeslot' in type_name or 'orders' in type_name:
                logger.info("Routing to update_time_slot")
                return update_time_slot(request, edit_item_id)
            elif 'job' in type_name and 'search' in type_name:
                logger.info("Routing to update_job_search")
                return update_job_search(request, edit_item_id)
            else:
                logger.info("Routing to update_task")
                return update_task(request, edit_item_id)
                
        except Exception as e:
            import traceback
            logger.error(f"Error in update_form: {e}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Only POST allowed'}, status=405)

def update_advertising(request, advertising_id):
    """Обновление рекламы"""
    try:
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"=== UPDATE ADVERTISING START ===")
        logger.info(f"Request method: {request.method}")
        logger.info(f"Request user: {request.user}")
        logger.info(f"Request POST data: {dict(request.POST)}")
        logger.info(f"Advertising ID: {advertising_id}")
        
        # Получаем объект рекламы
        advertising = Advertising.objects.get(id=advertising_id)
        logger.info(f"Found advertising: {advertising.title}")
        
        # Проверяем права доступа через AdvertisingOwnerRelations
        logger.info(f"Checking permissions for user {request.user} on advertising {advertising_id}")
        
        try:
            owner_relation = AdvertisingOwnerRelations.objects.filter(advertising=advertising, user=request.user).first()
            if not owner_relation:
                logger.warning(f"User {request.user} does not have permission to edit advertising {advertising_id}")
                return JsonResponse({'success': False, 'error': 'You do not have permission to edit this advertising'}, status=403)
            logger.info(f"Permission granted for user {request.user}")
        except Exception as e:
            logger.error(f"Error checking permissions: {e}")
            return JsonResponse({'success': False, 'error': f'Error checking permissions: {str(e)}'}, status=500)
        
        # Получаем данные из формы
        title = request.POST.get('title', '').strip()
        description = request.POST.get('description', '').strip()
        category_id = request.POST.get('category')
        service_id = request.POST.get('service')
        
        # Валидация обязательных полей
        if not title:
            return JsonResponse({'success': False, 'error': 'Title is required'}, status=400)
        if not description:
            return JsonResponse({'success': False, 'error': 'Description is required'}, status=400)
        
        # Обновляем основные поля
        advertising.title = title
        advertising.description = description
        
        # Обновляем сервис (у Advertising есть поле services как ForeignKey)
        if service_id:
            try:
                logger.info(f"Updating service to ID: {service_id}")
                service = Services.objects.get(id=service_id)
                advertising.services = service
                logger.info(f"Service updated to: {service.service_name}")
            except Services.DoesNotExist:
                logger.warning(f"Service with ID {service_id} not found")
                pass
            except Exception as e:
                logger.error(f"Error updating service: {e}")
                pass
        
        # Сохраняем изменения
        logger.info("Saving advertising changes...")
        try:
            advertising.save()
            logger.info("Advertising saved successfully")
        except Exception as e:
            logger.error(f"Error saving advertising: {e}")
            return JsonResponse({'success': False, 'error': f'Error saving changes: {str(e)}'}, status=500)
        
        # Обновляем хештеги
        hashtags_data = request.POST.get('hashtags')
        logger.info(f"Hashtags data received: {hashtags_data}")
        
        if hashtags_data:
            try:
                hashtags = json.loads(hashtags_data)
                logger.info(f"Parsed hashtags: {hashtags}")
                
                # Удаляем старые связи
                AdvertisingHashtagRelations.objects.filter(advertising=advertising).delete()
                logger.info("Old hashtag relations deleted")
                
                # Создаем новые связи
                for tag_name in hashtags:
                    tag, created = AllTags.objects.get_or_create(tag=tag_name.strip())
                    AdvertisingHashtagRelations.objects.create(
                        advertising=advertising,
                        hashtag=tag
                    )
                    logger.info(f"Created hashtag relation: {tag.tag}")
            except json.JSONDecodeError as e:
                logger.error(f"JSON decode error for hashtags: {e}")
                logger.error(f"Raw hashtags data: {hashtags_data}")
            except Exception as e:
                logger.error(f"Error processing hashtags: {e}")
        else:
            logger.info("No hashtags data received")
        
        # Обрабатываем новые фото
        new_photos = request.FILES.getlist('photos')
        if new_photos:
            logger.info(f"Processing {len(new_photos)} new photos")
            
            try:
                # Сначала удаляем все существующие фото
                existing_photos = advertising.photos.all()
                logger.info(f"Removing {existing_photos.count()} existing photos")
                advertising.photos.clear()
                
                # Удаляем старые PhotoRelations (опционально, если хотите полностью очистить)
                # PhotoRelations.objects.filter(id__in=[p.id for p in existing_photos]).delete()
                
                # Добавляем новые фото
                for photo_file in new_photos:
                    logger.info(f"Processing photo: {photo_file.name}, size: {photo_file.size} bytes")
                    
                    # Создаем новую запись PhotoRelations
                    photo_relation = PhotoRelations.objects.create(photo=photo_file)
                    logger.info(f"Created photo relation: {photo_relation.id}")
                    
                    # Добавляем связь с рекламным постом
                    advertising.photos.add(photo_relation)
                    logger.info(f"Added photo {photo_relation.id} to advertising {advertising_id}")
                
                logger.info(f"Successfully processed {len(new_photos)} new photos")
            except Exception as e:
                logger.error(f"Error processing new photos: {e}")
                return JsonResponse({'success': False, 'error': f'Error processing photos: {str(e)}'}, status=500)
        else:
            logger.info("No new photos uploaded - keeping existing photos")
        
        return JsonResponse({
            'success': True,
            'message': 'Advertising updated successfully',
            'advertising_id': advertising.id
        })
        
    except Advertising.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Advertising not found'}, status=404)
    except Exception as e:
        logger.error(f"Error updating advertising: {e}")
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

def update_task(request, task_id):
    """Обновление задачи"""
    try:
        import logging
        from datetime import datetime
        logger = logging.getLogger(__name__)
        
        task = Task.objects.get(id=task_id)
        
        # Проверяем права доступа
        if not TaskOwnerRelations.objects.filter(task=task, user=request.user).exists():
            return JsonResponse({'success': False, 'error': 'You do not have permission to edit this task'}, status=403)
        
        # Получаем данные из формы
        title = request.POST.get('title', '').strip()
        description = request.POST.get('description', '').strip()
        priority = request.POST.get('priority', '').strip()
        date_start = request.POST.get('date_start', '').strip()
        date_end = request.POST.get('date_end', '').strip()
        
        logger.info(f"Updating task {task_id}: title={title}, priority={priority}, date_start={date_start}, date_end={date_end}")
        
        # Валидация
        if not title:
            return JsonResponse({'success': False, 'error': 'Title is required'}, status=400)
        
        # Обновляем поля
        task.title = title
        task.description = description if description else ''
        
        # Обновляем priority
        if priority:
            if priority in ['iu', 'inu', 'niu', 'ninu']:
                task.priority = priority
            else:
                logger.warning(f"Invalid priority value: {priority}")
        else:
            task.priority = None
        
        # Обновляем date_start
        if date_start:
            try:
                # Преобразуем строку даты в datetime
                task.start_datetime = datetime.strptime(date_start, '%Y-%m-%d')
                logger.info(f"Set start_datetime to {task.start_datetime}")
            except ValueError as e:
                logger.warning(f"Invalid date_start format: {date_start}, error: {e}")
        else:
            task.start_datetime = None
        
        # Обновляем date_end
        if date_end:
            try:
                # Преобразуем строку даты в datetime
                task.end_datetime = datetime.strptime(date_end, '%Y-%m-%d')
                logger.info(f"Set end_datetime to {task.end_datetime}")
            except ValueError as e:
                logger.warning(f"Invalid date_end format: {date_end}, error: {e}")
        else:
            task.end_datetime = None
        
        task.save()
        logger.info(f"Task {task_id} updated successfully")
        
        return JsonResponse({
            'success': True,
            'message': 'Task updated successfully',
            'task_id': task.id
        })
        
    except Task.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Task not found'}, status=404)
    except Exception as e:
        logger.error(f"Error updating task: {e}")
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

def update_time_slot(request, time_slot_id):
    """Обновление временного слота"""
    try:
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"=== UPDATE TIME SLOT START ===")
        logger.info(f"Time slot ID: {time_slot_id}")
        logger.info(f"Request POST data: {dict(request.POST)}")
        
        time_slot = TimeSlot.objects.get(id=time_slot_id)
        
        # Проверяем права доступа
        if not TimeSlotOwnerRelations.objects.filter(time_slot=time_slot, user=request.user).exists():
            logger.warning(f"User {request.user} does not have permission to edit time slot {time_slot_id}")
            return JsonResponse({'success': False, 'error': 'You do not have permission to edit this time slot'}, status=403)
        
        logger.info(f"Permission granted for user {request.user}")
        
        # Получаем данные из формы
        category_id = request.POST.get('category')
        service_id = request.POST.get('services')
        date_start = request.POST.get('date_start')
        time_start = request.POST.get('time_start')
        date_end = request.POST.get('date_end')
        time_end = request.POST.get('time_end')
        reserved_time_on_road = request.POST.get('reserved_time_on_road')
        start_location = request.POST.get('start_location')
        cost_of_1_hour_of_work = request.POST.get('cost_of_1_hour_of_work')
        minimum_time_slot = request.POST.get('minimum_time_slot')
        hashtags = request.POST.get('hashtags')
        
        logger.info(f"Received data: category={category_id}, service={service_id}, date_start={date_start}, time_start={time_start}")
        logger.info(f"Additional data: date_end={date_end}, time_end={time_end}, reserved_time={reserved_time_on_road}, start_location={start_location}")
        logger.info(f"Cost data: cost={cost_of_1_hour_of_work}, min_slot={minimum_time_slot}, hashtags={hashtags}")
        
        # Валидация обязательных полей
        # Note: category_id is not stored in TimeSlot model, only service_id is used
        if not service_id:
            return JsonResponse({'success': False, 'error': 'Service is required'}, status=400)
        if not date_start:
            return JsonResponse({'success': False, 'error': 'Start date is required'}, status=400)
        if not time_start:
            return JsonResponse({'success': False, 'error': 'Start time is required'}, status=400)
        if not date_end:
            return JsonResponse({'success': False, 'error': 'End date is required'}, status=400)
        if not time_end:
            return JsonResponse({'success': False, 'error': 'End time is required'}, status=400)
        
        # Обновляем поля
        if service_id:
            try:
                service = Services.objects.get(id=service_id)
                time_slot.services = service
            except Services.DoesNotExist:
                return JsonResponse({'success': False, 'error': 'Invalid service'}, status=400)
        
        if date_start:
            time_slot.date_start = date_start
        
        if time_start:
            time_slot.time_start = time_start
        
        if date_end:
            time_slot.date_end = date_end
        
        if time_end:
            time_slot.time_end = time_end
        
        if reserved_time_on_road:
            try:
                time_slot.reserved_time_on_road = int(reserved_time_on_road)
            except (ValueError, TypeError) as e:
                logger.warning(f"Invalid reserved_time_on_road value: {reserved_time_on_road}, error: {e}")
                return JsonResponse({'success': False, 'error': 'Invalid reserved time value'}, status=400)
        
        if start_location:
            time_slot.start_location = start_location
        
        if cost_of_1_hour_of_work:
            try:
                time_slot.cost_of_1_hour_of_work = float(cost_of_1_hour_of_work)
            except (ValueError, TypeError) as e:
                logger.warning(f"Invalid cost_of_1_hour_of_work value: {cost_of_1_hour_of_work}, error: {e}")
                return JsonResponse({'success': False, 'error': 'Invalid cost value'}, status=400)
        
        if minimum_time_slot:
            time_slot.minimum_time_slot = minimum_time_slot
        
        # Обновляем hashtags
        if hashtags:
            try:
                hashtags_list = json.loads(hashtags)
                # Очищаем существующие hashtags
                time_slot.hashtags.clear()
                # Добавляем новые hashtags
                for tag_name in hashtags_list:
                    if tag_name.strip():
                        hashtag, created = AllTags.objects.get_or_create(tag=tag_name.strip())
                        time_slot.hashtags.add(hashtag)
            except (json.JSONDecodeError, ValueError) as e:
                logger.warning(f"Error parsing hashtags: {e}")
        
        try:
            time_slot.save()
            logger.info(f"Time slot {time_slot_id} updated successfully")
            
            return JsonResponse({
                'success': True,
                'message': 'Time slot updated successfully',
                'time_slot_id': time_slot.id
            })
        except Exception as e:
            logger.error(f"Error saving time slot: {e}")
            import traceback
            logger.error(f"Save error traceback: {traceback.format_exc()}")
            return JsonResponse({'success': False, 'error': f'Error saving time slot: {str(e)}'}, status=500)
        
    except TimeSlot.DoesNotExist:
        logger.error(f"Time slot {time_slot_id} not found")
        return JsonResponse({'success': False, 'error': 'Time slot not found'}, status=404)
    except Exception as e:
        logger.error(f"Error updating time slot: {e}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

def update_job_search(request, job_search_id):
    """Обновление поиска работы"""
    try:
        import logging
        logger = logging.getLogger(__name__)
        
        job_search = JobSearch.objects.get(id=job_search_id)
        
        # Проверяем права доступа
        if job_search.user != request.user:
            return JsonResponse({'success': False, 'error': 'You do not have permission to edit this job search'}, status=403)
        
        # Получаем данные из формы
        title = request.POST.get('title', '').strip()
        description = request.POST.get('description', '').strip()
        
        # Валидация
        if not title:
            return JsonResponse({'success': False, 'error': 'Title is required'}, status=400)
        
        # Обновляем поля
        job_search.title = title
        if description:
            job_search.description = description
        job_search.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Job search updated successfully',
            'job_search_id': job_search.id
        })
        
    except JobSearch.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Job search not found'}, status=404)
    except Exception as e:
        logger.error(f"Error updating job search: {e}")
        return JsonResponse({'success': False, 'error': str(e)}, status=500)
