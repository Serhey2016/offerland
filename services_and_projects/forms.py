from django.shortcuts import render, redirect
from .models import Task, TypeOfTask, TaskStatus, Finance, ServicesCategory, Services, ServicesRelations, Advertising, TimeSlot
from django.contrib.auth.models import User
from django.http import JsonResponse
from joblist.models import AllTags
from .models import TaskHashtagRelations, AdvertisingHashtagRelations, TimeSlotHashtagRelations
from decimal import Decimal
import json

def none_if_empty(val):
    return val if val not in (None, '', 'None', 'null') else None

def create_task(request):
    if request.method == 'POST':
        try:
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
            hide_project = bool(request.POST.get('hide_project'))
            disclose_name = bool(request.POST.get('disclose_name'))
            hidden_task = bool(request.POST.get('hidden_task'))
            is_published = False  # или по логике вашей кнопки
            note = none_if_empty(request.POST.get('note') or request.POST.get('comment'))
            finance_id = none_if_empty(request.POST.get('finance'))
            parent_id = none_if_empty(request.POST.get('parent') or request.POST.get('project-included'))
            category_id = none_if_empty(request.POST.get('category'))
            service_id = none_if_empty(request.POST.get('service'))

            # Создаём Task
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
                hide_project=hide_project,
                disclose_name=disclose_name,
                hidden_task=hidden_task,
                is_published=is_published,
                note=note,
                finance_id=finance_id,
                parent_id=parent_id
            )

            # ManyToMany: hashtags, performers, services
            hashtags = request.POST.getlist('hashtags')
            if hashtags:
                for tag_id in hashtags:
                    try:
                        tag_obj = AllTags.objects.get(id=tag_id)
                        TaskHashtagRelations.objects.get_or_create(task=task, hashtag=tag_obj)
                    except AllTags.DoesNotExist:
                        pass

            # Связь с сервисом через ServicesRelations
            if service_id:
                try:
                    service = Services.objects.get(id=service_id)
                    ServicesRelations.objects.create(task=task, service=service)
                except Services.DoesNotExist:
                    pass

            # Обработка исполнителей
            performers_data = request.POST.get('performers')
            if performers_data:
                try:
                    performers = json.loads(performers_data)
                    for performer_name in performers:
                        # Здесь можно создать пользователя или связать с существующим
                        # Пока просто логируем
                        print(f"Performer: {performer_name}")
                except json.JSONDecodeError:
                    pass

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
            # Получаем данные из формы для рекламы
            title = none_if_empty(request.POST.get('title'))
            description = none_if_empty(request.POST.get('description'))
            photo_link = none_if_empty(request.POST.get('photo_link') or request.POST.get('photos-link'))
            type_of_task_id = none_if_empty(request.POST.get('type_of_task'))
            service_id = none_if_empty(request.POST.get('service'))

            # Создаём Advertising
            advertising = Advertising.objects.create(
                title=title,
                description=description,
                type_of_task_id=type_of_task_id,
                services_id=service_id
            )

            # Добавляем хэштеги
            hashtags = request.POST.getlist('hashtags')
            if hashtags:
                for tag_id in hashtags:
                    try:
                        tag_obj = AllTags.objects.get(id=tag_id)
                        AdvertisingHashtagRelations.objects.get_or_create(advertising=advertising, hashtag=tag_obj)
                    except AllTags.DoesNotExist:
                        pass

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
            # Получаем данные из формы для time slot
            date_start = none_if_empty(request.POST.get('date1'))
            date_end = none_if_empty(request.POST.get('date2'))
            time_start = none_if_empty(request.POST.get('time1'))
            time_end = none_if_empty(request.POST.get('time2'))
            reserved_time = none_if_empty(request.POST.get('reserved_time'))
            start_location = none_if_empty(request.POST.get('start_location'))
            cost_hour = none_if_empty(request.POST.get('cost_hour'))
            min_slot = none_if_empty(request.POST.get('min_slot'))
            ts_services = none_if_empty(request.POST.get('ts-services'))
            type_of_task_id = none_if_empty(request.POST.get('type_of_task'))
            service_id = none_if_empty(request.POST.get('service'))

            # Преобразуем cost_hour в центы (умножаем на 100)
            cost_in_cents = None
            if cost_hour:
                try:
                    cost_in_cents = Decimal(cost_hour) * 100
                except (ValueError, TypeError):
                    cost_in_cents = Decimal('0')

            # Создаём TimeSlot
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

            # Добавляем хэштеги
            hashtags = request.POST.getlist('ts-hashtags')
            if hashtags:
                for tag_id in hashtags:
                    try:
                        tag_obj = AllTags.objects.get(id=tag_id)
                        TimeSlotHashtagRelations.objects.get_or_create(time_slot=time_slot, hashtag=tag_obj)
                    except AllTags.DoesNotExist:
                        pass

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
            # Определяем тип публикации
            type_of_task_id = request.POST.get('type_of_task')
            
            if not type_of_task_id:
                return JsonResponse({'success': False, 'error': 'Type of task is required'}, status=400)
            
            # Получаем объект TypeOfTask для определения типа
            try:
                type_of_task = TypeOfTask.objects.get(id=type_of_task_id)
                type_name = type_of_task.type_of_task_name.lower()
            except TypeOfTask.DoesNotExist:
                return JsonResponse({'success': False, 'error': 'Invalid type of task'}, status=400)
            
            # Направляем на соответствующую функцию в зависимости от типа
            if 'advertising' in type_name:
                return create_advertising(request)
            elif 'time slot' in type_name or 'timeslot' in type_name:
                return create_time_slot(request)
            else:
                # Для остальных типов (My list, Tender, Project) используем create_task
                return create_task(request)
                
        except Exception as e:
            import traceback
            print('Error in handle_form_submission:', e)
            traceback.print_exc()
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Only POST allowed'}, status=405)
