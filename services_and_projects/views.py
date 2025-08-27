from django.shortcuts import render
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.utils.http import urlencode
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from .models import TypeOfTask, ServicesCategory, Services, TaskStatus, Task, TaskOwnerRelations, Advertising, AdvertisingOwnerRelations, JobSearch, TimeSlot, TimeSlotOwnerRelations
from joblist.models import AllTags, Companies
from django.utils import timezone
import json

# Create your views here.

def testpage(request):
    # Get filter parameters from request
    status_filter = request.GET.get('status', 'all')
    category_filter = request.GET.get('category', 'all')
    
    types = TypeOfTask.objects.all()
    categories = ServicesCategory.objects.all()
    services = Services.objects.all()
    statuses = TaskStatus.objects.all()
    all_tags = json.dumps(list(AllTags.objects.values('id', 'tag')))
    # Получаем все компании для отладки
    companies_queryset = Companies.objects.values('id_company', 'company_name')
    print(f"DEBUG: Found {companies_queryset.count()} companies in database")
    for company in companies_queryset[:5]:  # Показываем первые 5 компаний
        print(f"DEBUG: Company - ID: {company['company_name']}")
    
    all_companies = json.dumps(list(companies_queryset))
    print(f"DEBUG: all_companies JSON: {all_companies[:200]}...")  # Показываем первые 200 символов
    tasks = Task.objects.filter(taskownerrelations__user=request.user) if request.user.is_authenticated else Task.objects.none()
    
    # --- Динамический блок social_feed ---
    # Получаем все элементы Advertising с их владельцами
    advertisings = Advertising.objects.select_related('services', 'type_of_task').prefetch_related('photos', 'hashtags').order_by('-creation_date')
    
    # Apply status filter for advertising
    if status_filter == 'draft':
        advertisings = advertisings.filter(adv_mode='draft')
    elif status_filter == 'published':
        advertisings = advertisings.filter(adv_mode='published')
    elif status_filter == 'archived':
        advertisings = advertisings.filter(adv_mode='archived')
    elif status_filter == 'all':
        # Show only draft items in "All" category
        advertisings = advertisings.filter(adv_mode='draft')
    
    advertising_data = []
    
    for advertising in advertisings:
        owner_rel = AdvertisingOwnerRelations.objects.select_related('user').filter(advertising=advertising).first()
        owner = owner_rel.user if owner_rel else None
        task = Task.objects.filter(
            services=advertising.services,
            type_of_task=advertising.type_of_task
        ).order_by('-created_at').first()
        
        advertising_data.append({
            'advertising': advertising,
            'owner': owner,
            'task': task
        })
    
    # Получаем все задачи для отображения в потоке
    tasks_for_feed = Task.objects.select_related('type_of_task', 'status', 'finance').prefetch_related(
        'photos', 'hashtags', 'performers', 'services'
    ).order_by('-created_at')
    
    # Apply status filter for tasks
    if status_filter == 'draft':
        tasks_for_feed = tasks_for_feed.filter(task_mode='draft')
    elif status_filter == 'published':
        tasks_for_feed = tasks_for_feed.filter(task_mode='published')
    elif status_filter == 'archived':
        tasks_for_feed = tasks_for_feed.filter(task_mode='archived')
    elif status_filter == 'all':
        # Show only draft items in "All" category
        tasks_for_feed = tasks_for_feed.filter(task_mode='draft')
    
    # Получаем все записи JobSearch для отображения в потоке
    job_searches_for_feed = JobSearch.objects.select_related('user').order_by('-start_date')
    
    # Apply status filter for job searches
    if status_filter == 'draft':
        job_searches_for_feed = job_searches_for_feed.filter(js_mode='draft')
    elif status_filter == 'published':
        job_searches_for_feed = job_searches_for_feed.filter(js_mode='published')
    elif status_filter == 'archived':
        job_searches_for_feed = job_searches_for_feed.filter(js_mode='archived')
    elif status_filter == 'all':
        # Show only draft items in "All" category
        job_searches_for_feed = job_searches_for_feed.filter(js_mode='draft')
    
    # Получаем все TimeSlot для отображения в потоке
    time_slots_for_feed = TimeSlot.objects.select_related('type_of_task', 'services').prefetch_related(
        'hashtags', 'performers', 'photos'
    ).order_by('-date_start')
    
    # Apply status filter for time slots
    if status_filter == 'draft':
        time_slots_for_feed = time_slots_for_feed.filter(ts_mode='draft')
    elif status_filter == 'published':
        time_slots_for_feed = time_slots_for_feed.filter(ts_mode='published')
    elif status_filter == 'archived':
        time_slots_for_feed = time_slots_for_feed.filter(ts_mode='archived')
    elif status_filter == 'all':
        # Show only draft items in "All" category
        time_slots_for_feed = time_slots_for_feed.filter(ts_mode='draft')
    
    # Создаем список всех элементов для потока (реклама + задачи + job searches + time slots)
    feed_items = []
    
    # Добавляем рекламу
    for item in advertising_data:
        feed_items.append({
            'type': 'advertising',
            'data': item
        })
    
    # Добавляем задачи
    for task in tasks_for_feed:
        feed_items.append({
            'type': 'task',
            'data': task
        })
    
    # Добавляем JobSearch записи
    for job_search in job_searches_for_feed:
        feed_items.append({
            'type': 'job_search',
            'data': job_search
        })
    
    # Добавляем TimeSlot записи
    for time_slot in time_slots_for_feed:
        # Получаем владельца TimeSlot
        owner_rel = TimeSlotOwnerRelations.objects.select_related('user').filter(time_slot=time_slot).first()
        owner = owner_rel.user if owner_rel else None
        
        feed_items.append({
            'type': 'time_slot',
            'data': {
                'time_slot': time_slot,
                'owner': owner
            }
        })
    
    # Отладочная информация о количестве записей каждого типа после фильтрации
    print(f"DEBUG: After filtering with status='{status_filter}':")
    print(f"  - Advertising: {len(advertising_data)} items")
    print(f"  - Tasks: {len(tasks_for_feed)} items")
    print(f"  - JobSearches: {len(job_searches_for_feed)} items")
    print(f"  - TimeSlots: {len(time_slots_for_feed)} items")
    print(f"  - Total feed items: {len(feed_items)} items")
    
    # Сортируем по дате создания (новые сначала)
    # Приводим все даты к datetime.date для корректного сравнения
    def get_sort_date(item):
        try:
            if item['type'] == 'task':
                if hasattr(item['data'], 'created_at') and item['data'].created_at:
                    # Приводим к date
                    if hasattr(item['data'].created_at, 'date'):
                        return item['data'].created_at.date()
                    elif hasattr(item['data'].created_at, 'strftime'):
                        # Если это date, возвращаем как есть
                        return item['data'].created_at
                    else:
                        print(f"Unexpected type for task created_at: {type(item['data'].created_at)}")
                        return None
                return None
            elif item['type'] == 'job_search':
                if hasattr(item['data'], 'start_date') and item['data'].start_date:
                    # Приводим к date
                    if hasattr(item['data'].start_date, 'date'):
                        return item['data'].start_date.date()
                    elif hasattr(item['data'].start_date, 'strftime'):
                        # Если это date, возвращаем как есть
                        return item['data'].start_date
                    else:
                        print(f"Unexpected type for job_search start_date: {type(item['data'].start_date)}")
                        return None
                return None
            elif item['type'] == 'advertising':
                if hasattr(item['data']['advertising'], 'creation_date') and item['data']['advertising'].creation_date:
                    # Приводим к date
                    if hasattr(item['data']['advertising'].creation_date, 'date'):
                        return item['data']['advertising'].creation_date.date()
                    elif hasattr(item['data']['advertising'].creation_date, 'strftime'):
                        # Если это date, возвращаем как есть
                        return item['data']['advertising'].creation_date
                    else:
                        print(f"Unexpected type for advertising creation_date: {type(item['data']['advertising'].creation_date)}")
                        return None
                return None
            elif item['type'] == 'time_slot':
                if hasattr(item['data']['time_slot'], 'date_start') and item['data']['time_slot'].date_start:
                    # Приводим к date
                    if hasattr(item['data']['time_slot'].date_start, 'date'):
                        return item['data']['time_slot'].date_start.date()
                    elif hasattr(item['data']['time_slot'].date_start, 'strftime'):
                        # Если это date, возвращаем как есть
                        return item['data']['time_slot'].date_start
                    else:
                        print(f"Unexpected type for time_slot date_start: {type(item['data']['time_slot'].date_start)}")
                        return None
                return None
            else:
                if hasattr(item['data'], 'created_at') and item['data'].created_at:
                    # Приводим к date
                    if hasattr(item['data'].created_at, 'date'):
                        return item['data'].created_at.date()
                    elif hasattr(item['data'].created_at, 'strftime'):
                        # Если это date, возвращаем как есть
                        return item['data'].created_at
                    else:
                        print(f"Unexpected type for default created_at: {type(item['data'].created_at)}")
                        return None
                return None
        except Exception as e:
            print(f"Error getting sort date for item {item['type']}: {e}")
            return None
    
    # Фильтруем элементы с None датами и сортируем остальные
    valid_items = [item for item in feed_items if get_sort_date(item) is not None]
    invalid_items = [item for item in feed_items if get_sort_date(item) is None]
    
    print(f"Valid items for sorting: {len(valid_items)}")
    print(f"Invalid items (no date): {len(invalid_items)}")
    
    # Дополнительная проверка типов дат
    for item in valid_items:
        sort_date = get_sort_date(item)
        if sort_date is not None:
            print(f"Item {item['type']} sort date: {sort_date} (type: {type(sort_date)})")
    
    # Сортируем валидные элементы
    try:
        valid_items.sort(key=get_sort_date, reverse=True)
        print("Sorting completed successfully")
    except Exception as e:
        print(f"Error during sorting: {e}")
        # Если сортировка не удалась, оставляем элементы в исходном порядке
        feed_items = valid_items + invalid_items
        return render(request, 'services_and_projects/testpage.html', {
            'title': 'Test Page',
            'types': types,
            'categories': categories,
            'services': services,
            'statuses': statuses,
            'all_tags': all_tags,
            'all_companies': all_companies,
            'tasks': tasks,
            'page_obj': Paginator(feed_items, 10).page(1),
            'get_params': {},
        })
    
    # Объединяем: сначала отсортированные валидные, потом невалидные
    feed_items = valid_items + invalid_items
    
    print(f"Total feed items after sorting: {len(feed_items)}")
    
    # Пагинация
    paginator = Paginator(feed_items, 10)  # 10 элементов на страницу
    page = request.GET.get('page', 1)
    
    try:
        page_obj = paginator.page(page)
    except PageNotAnInteger:
        page_obj = paginator.page(1)
    except EmptyPage:
        page_obj = paginator.page(paginator.num_pages)
    
    # Сохраняем GET параметры для пагинации
    get_params = request.GET.copy()
    if 'page' in get_params:
        del get_params['page']
    
    return render(request, 'services_and_projects/testpage.html', {
        'title': 'Test Page',
        'types': types,
        'categories': categories,
        'services': services,
        'statuses': statuses,
        'all_tags': all_tags,
        'all_companies': all_companies,
        'tasks': tasks,
        'page_obj': page_obj,
        'get_params': get_params,
    })

from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required

@login_required
@require_POST
def save_task_notes(request, task_id):
    """Сохранение заметок к задаче"""
    try:
        task = Task.objects.get(id=task_id)
        
        # Проверяем, что пользователь имеет доступ к задаче
        # (владелец или исполнитель)
        is_owner = TaskOwnerRelations.objects.filter(task=task, user=request.user).exists()
        is_performer = task.performers.filter(id=request.user.id).exists()
        
        if not (is_owner or is_performer):
            return JsonResponse({
                'success': False,
                'error': 'You do not have permission to edit this task'
            }, status=403)
        
        notes = request.POST.get('notes', '').strip()
        task.note = notes
        task.save()
        
        return JsonResponse({
            'success': True
        })
        
    except Task.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Task not found'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error saving: {str(e)}'
        }, status=500)

@login_required
@require_POST
def save_job_search_notes(request, job_search_id):
    """Сохранение заметок к Job Search"""
    try:
        job_search = JobSearch.objects.get(id=job_search_id)
        
        # Проверяем, что пользователь имеет доступ к Job Search
        if job_search.user != request.user:
            return JsonResponse({
                'success': False,
                'error': 'You do not have permission to edit this job search'
            }, status=403)
        
        notes = request.POST.get('notes', '').strip()
        job_search.notes = notes
        job_search.save()  # last_update автоматически обновится
        
        return JsonResponse({
            'success': True
        })
        
    except JobSearch.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Job Search not found'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error saving: {str(e)}'
        }, status=500)

@login_required
@require_POST
def add_job_search_activity(request, job_search_id):
    """Добавление новой активности к Job Search"""
    try:
        job_search = JobSearch.objects.get(id=job_search_id)
        
        # Проверяем, что пользователь имеет доступ к Job Search
        if job_search.user != request.user:
            return JsonResponse({
                'success': False,
                'error': 'You do not have permission to add activity to this job search'
            }, status=403)
        
        # Получаем данные из формы
        company_name = request.POST.get('company_name', '').strip()
        link_to_vacancy = request.POST.get('link_to_vacancy', '').strip()
        cv_file = request.FILES.get('cv_file')
        
        # Логируем полученные данные для отладки
        print(f"DEBUG: Received form data:")
        print(f"  company_name: '{company_name}'")
        print(f"  link_to_vacancy: '{link_to_vacancy}'")
        print(f"  cv_file: {cv_file}")
        print(f"  POST data: {dict(request.POST)}")
        print(f"  FILES data: {dict(request.FILES)}")
        
        # Обрабатываем company_name (может содержать несколько компаний через запятую)
        if company_name and ',' in company_name:
            company_name = company_name.split(',')[0].strip()  # Берем первую компанию
        
        # Валидация обязательных полей
        if not company_name or not link_to_vacancy:
            return JsonResponse({
                'success': False,
                'error': 'Company name and Vacancy link are required fields'
            }, status=400)
        
        # Получаем или создаем компанию
        from joblist.models import Companies
        company, created = Companies.objects.get_or_create(
            company_name=company_name,
            defaults={
                'description': f'Company created from Job Search activity'
            }
        )
        
        # Создаем активность
        from .models import Activities
        from django.utils import timezone
        
        activity = Activities.objects.create(
            title=f"Activity at {company_name}",
            company=company,
            link_to_vacancy=link_to_vacancy,
            cv_file=cv_file,
            status='unsuccessful',  # Статус по умолчанию
            location='',  # Пустая строка по умолчанию
            job_description='',  # Пустая строка по умолчанию
            context='',  # Пустая строка по умолчанию
            start_date=timezone.now()  # Устанавливаем текущее время
        )
        
        # Связываем активность с Job Search
        from .models import JobSearchActivitiesRelations
        JobSearchActivitiesRelations.objects.create(
            job_search=job_search,
            activity=activity
        )
        
        return JsonResponse({
            'success': True,
            'activity_id': activity.id,
            'message': 'Activity added successfully'
        })
        
    except JobSearch.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Job Search not found'
        }, status=404)
    except Exception as e:
        import traceback
        print(f"Error in add_job_search_activity: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        return JsonResponse({
            'success': False,
            'error': f'Error adding activity: {str(e)}'
        }, status=500)


@login_required
@require_POST
def start_job_search(request, job_search_id):
    """Set start date for Job Search"""
    try:
        job_search = JobSearch.objects.get(id=job_search_id)
        
        # Check if user has permission to start this job search
        if job_search.user != request.user:
            return JsonResponse({
                'success': False,
                'error': 'You do not have permission to start this job search'
            }, status=403)
        
        # Check if start date is already set
        if job_search.start_date:
            return JsonResponse({
                'success': False,
                'warning': True,
                'message': 'You have already started the process'
            })
        
        # Set current date as start date
        from django.utils import timezone
        job_search.start_date = timezone.now()
        job_search.save()
        
        # Format date for display
        formatted_date = job_search.start_date.strftime('%d.%m.%Y')
        
        return JsonResponse({
            'success': True,
            'start_date': formatted_date,
            'message': 'Job search started successfully'
        })
        
    except JobSearch.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Job Search not found'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error starting job search: {str(e)}'
        }, status=500)


@login_required
@require_POST
def change_advertising_status(request, advertising_id):
    """Change advertising mode (draft, published, archived)"""
    try:
        advertising = Advertising.objects.get(id=advertising_id)
        
        # Check if user has permission to change advertising mode
        owner_rel = AdvertisingOwnerRelations.objects.filter(advertising=advertising, user=request.user).first()
        if not owner_rel:
            return JsonResponse({
                'success': False,
                'error': 'You do not have permission to change this advertising mode'
            }, status=403)
        
        # Get new advertising mode from request
        new_status = request.POST.get('adv_mode')
        if new_status not in ['draft', 'published', 'archived']:
            return JsonResponse({
                'success': False,
                'error': 'Invalid advertising mode. Must be draft, published, or archived'
            }, status=400)
        
        # Update advertising mode
        advertising.adv_mode = new_status
        
        # Update publication date if publishing
        if new_status == 'published':
            advertising.publication_date = timezone.now()
        
        advertising.save()
        
        return JsonResponse({
            'success': True,
            'status': new_status,
            'message': f'Advertising mode changed to {new_status} successfully'
        })
        
    except Advertising.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Advertising not found'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error changing advertising status: {str(e)}'
        }, status=500)


@login_required
@require_POST
def start_task(request, task_id):
    """Set start date for Task (Project, Tender, My List, etc.)"""
    try:
        from .models import Task
        
        task = Task.objects.get(id=task_id)
        
        # Check if user has permission to start this task
        # For now, we'll allow any authenticated user to start any task
        # You can add more specific permission checks here if needed
        
        # Check if start date is already set
        if task.date_start:
            return JsonResponse({
                'success': False,
                'warning': True,
                'message': 'Task has already been started'
            })
        
        # Set current date as start date
        from django.utils import timezone
        task.date_start = timezone.now().date()
        task.save()
        
        # Format date for display
        formatted_date = task.date_start.strftime('%d.%m.%Y')
        
        return JsonResponse({
            'success': True,
            'start_date': formatted_date,
            'message': 'Task started successfully'
        })
        
    except Task.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Task not found'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error starting task: {str(e)}'
        }, status=500)

