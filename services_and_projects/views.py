from django.shortcuts import render
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.utils.http import urlencode
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST, require_http_methods
from django.views.decorators.csrf import csrf_exempt
from .models import ServicesCategory, Services, TaskStatus, Task, TaskOwnerRelations, Advertising, AdvertisingOwnerRelations, JobSearch, TimeSlot, TimeSlotOwnerRelations, PhotoRelations, TaskHashtagRelations, CardTemplate
from joblist.models import AllTags, Companies
from django.utils import timezone
import json

# Create your views here.

def testpage(request):
    # Get filter parameters from request
    status_filter = request.GET.get('status', 'all')
    category_filter = request.GET.get('category', 'all')
    
    # Get card template choices from CardTemplate model
    types = CardTemplate.objects.all()
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
    advertisings = Advertising.objects.select_related('services').prefetch_related('photos', 'hashtags').order_by('-creation_date')
    
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
            card_template=advertising.card_template
        ).order_by('-created_at').first()
        
        advertising_data.append({
            'advertising': advertising,
            'owner': owner,
            'task': task
        })
    
    # Получаем все задачи для отображения в потоке
    tasks_for_feed = Task.objects.select_related('finance').prefetch_related(
        'photos', 'hashtags'
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
    time_slots_for_feed = TimeSlot.objects.select_related('services').prefetch_related(
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
def save_task_notes(request, task_slug):
    """Сохранение заметок к задаче или Job Search"""
    try:
        # Check if this is a JobSearch slug (starts with 'jobsearch-')
        if task_slug.startswith('jobsearch-'):
            job_search = JobSearch.objects.get(slug=task_slug, user=request.user)
            
            notes = request.POST.get('notes', '').strip()
            job_search.notes = notes
            job_search.save()  # last_update автоматически обновится
            
            return JsonResponse({
                'success': True
            })
        else:
            # Regular Task
            task = Task.objects.get(slug=task_slug, taskownerrelations__user=request.user)
            
            # Проверяем, что пользователь имеет доступ к задаче (владелец)
            is_owner = TaskOwnerRelations.objects.filter(task=task, user=request.user).exists()
            
            if not is_owner:
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
        
    except (Task.DoesNotExist, JobSearch.DoesNotExist):
        return JsonResponse({
            'success': False,
            'error': 'Task or Job Search not found'
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
def start_task(request, task_slug):
    """Set start date for Task (Project, Tender, My List, etc.)"""
    try:
        from .models import Task
        
        task = Task.objects.get(slug=task_slug, taskownerrelations__user=request.user)
        
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


@login_required
def user_tasks(request):
    """
    API endpoint to get tasks for authenticated user
    Filters tasks by status field based on category parameter
    Now uses UserTaskContext for per-user status tracking
    """
    try:
        from .models import UserTaskContext
        
        # Get category/status filter from query params
        category = request.GET.get('category', '').lower()
        
        # Get user's task contexts (this includes personal category/status)
        # Exclude subtasks (tasks with parent_id) from main lists
        user_task_contexts = UserTaskContext.objects.filter(
            user=request.user,
            is_visible=True,
            task__parent_id__isnull=True  # Only show parent tasks, hide subtasks
        ).select_related(
            'task',
            'task__card_template',
            'category'
        ).prefetch_related(
            'task__hashtags'
        )
        
        # Filter by category if category is provided and matches a valid position
        # Map category names to position values
        position_mapping = {
            'inbox': 'inbox',
            'backlog': 'backlog',
            'agenda': 'agenda',
            'waiting': 'waiting',
            'someday': 'someday',
            'projects': 'projects',
            'subtask': 'subtask',
            'done': 'done',
            'archive': 'archive'
        }
        
        if category in position_mapping:
            # Special handling for agenda - show tasks with category='agenda' OR task.is_agenda=True
            if category == 'agenda':
                from django.db.models import Q
                user_task_contexts = user_task_contexts.filter(
                    Q(category__name='agenda') | Q(task__is_agenda=True)
                )
            else:
                user_task_contexts = user_task_contexts.filter(category__name=position_mapping[category])
        
        user_task_contexts = user_task_contexts.order_by('-task__created_at')
        
        # Convert to list with hashtags
        tasks_data = []
        for context in user_task_contexts:
            task = context.task
            
            # Get hashtags for this task
            hashtag_relations = TaskHashtagRelations.objects.filter(task=task).select_related('hashtag')
            hashtags = [
                {
                    'id': rel.hashtag.id,
                    'tag_name': rel.hashtag.tag
                }
                for rel in hashtag_relations
            ]
            
            # Format dates properly - extract date part only
            date_start_str = None
            date_end_str = None
            if task.start_datetime:
                date_start_str = task.start_datetime.date().isoformat() if hasattr(task.start_datetime, 'date') else str(task.start_datetime).split('T')[0]
            if task.end_datetime:
                date_end_str = task.end_datetime.date().isoformat() if hasattr(task.end_datetime, 'date') else str(task.end_datetime).split('T')[0]
            
            task_data = {
                'id': task.id,
                'slug': task.slug,
                'title': task.title,
                'description': task.description,
                'date_start': date_start_str,
                'date_end': date_end_str,
                'time_start': task.start_datetime.isoformat() if task.start_datetime else None,
                'time_end': task.end_datetime.isoformat() if task.end_datetime else None,
                'start_datetime': task.start_datetime.isoformat() if task.start_datetime else None,
                'end_datetime': task.end_datetime.isoformat() if task.end_datetime else None,
                'priority': task.priority,
                'status': context.category.name if context.category else None,  # Use context's category
                'task_mode': task.task_mode,
                'note': task.note,
                'created_at': task.created_at.isoformat(),
                'updated_at': task.updated_at.isoformat(),
                'completed_at': context.completed_at.isoformat() if context.completed_at else None,  # Use context's completed_at
                'hashtags': hashtags,
                'card_template': task.card_template.name if task.card_template else 'task',
                'recurrence_pattern': task.recurrence_pattern,  # Додаємо recurrence_pattern
                'personal_note': context.personal_note,  # Add personal note from context
                'parent_id': task.parent_id,  # Add parent task ID for subtasks
                'subtasks_meta': task.subtasks_meta  # Add subtasks metadata for quick display
            }
            tasks_data.append(task_data)
        
        return JsonResponse(tasks_data, safe=False)
        
    except Exception as e:
        import traceback
        print(f"Error in user_tasks: {str(e)}")
        print(traceback.format_exc())
        return JsonResponse({
            'error': f'Error fetching user tasks: {str(e)}'
        }, status=500)


@login_required
def user_inbox_items(request):
    """
    API endpoint to get all items (Tasks, TimeSlots, Advertising, JobSearch) for authenticated user
    Returns items grouped by card_template for inbox category
    """
    try:
        # Get category/status filter from query params
        category = request.GET.get('category', '').lower()
        
        # Map category names to position values
        position_mapping = {
            'inbox': 'inbox',
            'backlog': 'backlog',
            'agenda': 'agenda',
            'waiting': 'waiting',
            'someday': 'someday',
            'projects': 'projects',
            'subtask': 'subtask',
            'done': 'done',
            'archive': 'archive'
        }
        
        all_items = []
        
        # Get Tasks through UserTaskContext
        from .models import UserTaskContext
        # Exclude subtasks (tasks with parent_id) from main inbox lists
        user_task_contexts = UserTaskContext.objects.filter(
            user=request.user,
            is_visible=True,
            task__parent_id__isnull=True  # Only show parent tasks, hide subtasks
        ).select_related(
            'task',
            'task__card_template',
            'category'
        ).prefetch_related(
            'task__hashtags'
        )
        
        if category in position_mapping:
            if category == 'agenda':
                from django.db.models import Q
                user_task_contexts = user_task_contexts.filter(
                    Q(category__name='agenda') | Q(task__is_agenda=True)
                )
            else:
                user_task_contexts = user_task_contexts.filter(category__name=position_mapping[category])
        
        user_task_contexts = user_task_contexts.order_by('-task__created_at')
        
        # Add tasks to all_items
        for context in user_task_contexts:
            task = context.task
            hashtag_relations = TaskHashtagRelations.objects.filter(task=task).select_related('hashtag')
            hashtags = [
                {
                    'id': rel.hashtag.id,
                    'tag_name': rel.hashtag.tag
                }
                for rel in hashtag_relations
            ]
            
            date_start_str = None
            date_end_str = None
            if task.start_datetime:
                date_start_str = task.start_datetime.date().isoformat() if hasattr(task.start_datetime, 'date') else str(task.start_datetime).split('T')[0]
            if task.end_datetime:
                date_end_str = task.end_datetime.date().isoformat() if hasattr(task.end_datetime, 'date') else str(task.end_datetime).split('T')[0]
            
            all_items.append({
                'id': task.id,
                'slug': task.slug,
                'title': task.title,
                'description': task.description,
                'date_start': date_start_str,
                'date_end': date_end_str,
                'time_start': task.start_datetime.isoformat() if task.start_datetime else None,
                'time_end': task.end_datetime.isoformat() if task.end_datetime else None,
                'priority': task.priority,
                'status': context.category.name if context.category else None,  # Use context's category
                'task_mode': task.task_mode,
                'note': task.note,
                'created_at': task.created_at.isoformat(),
                'updated_at': task.updated_at.isoformat(),
                'completed_at': context.completed_at.isoformat() if context.completed_at else None,  # Use context's completed_at
                'hashtags': hashtags,
                'card_template': task.card_template.name if task.card_template else 'task',
                'item_type': 'task',
                'parent_id': task.parent_id,  # Add parent task ID for subtasks
                'subtasks_meta': task.subtasks_meta  # Add subtasks metadata for quick display
            })
        
        # Get TimeSlots
        user_time_slots = TimeSlot.objects.filter(
            timeslotownerrelations__user=request.user
        ).select_related(
            'category', 'card_template', 'services'
        ).prefetch_related(
            'hashtags'
        )
        
        if category in position_mapping:
            user_time_slots = user_time_slots.filter(category__name=position_mapping[category])
        
        user_time_slots = user_time_slots.order_by('-date_start')
        
        # Add time slots to all_items
        for ts in user_time_slots:
            # Get time slot owner info
            time_slot_owner = None
            company_name = None
            
            # Get the owner through TimeSlotOwnerRelations
            try:
                owner_relation = TimeSlotOwnerRelations.objects.filter(time_slot=ts).first()
                if owner_relation:
                    time_slot_owner = owner_relation.user
                    # Check if user has a company in UserMeta
                    try:
                        from home.models import UserMeta
                        user_meta = UserMeta.objects.filter(user=time_slot_owner).first()
                        company_name = user_meta.company_name if user_meta and hasattr(user_meta, 'company_name') else None
                    except Exception:
                        company_name = None
            except Exception:
                time_slot_owner = None
            
            # Get hashtags for this time slot
            ts_hashtags = []
            hashtag_relations = ts.hashtags.all()
            for hashtag in hashtag_relations:
                ts_hashtags.append({
                    'id': hashtag.id,
                    'tag_name': hashtag.tag
                })
            
            all_items.append({
                'id': ts.id,
                'title': f"Time Slot: {ts.date_start} - {ts.date_end}",
                'description': f"{ts.services.service_name if ts.services else 'No service'} ({ts.time_start} - {ts.time_end})",
                'date_start': ts.date_start.isoformat(),
                'date_end': ts.date_end.isoformat(),
                'time_start': ts.time_start.isoformat() if ts.time_start else None,
                'time_end': ts.time_end.isoformat() if ts.time_end else None,
                'priority': None,
                'status': ts.category.name if ts.category else None,
                'task_mode': ts.ts_mode,
                'note': None,
                'created_at': None,
                'updated_at': None,
                'hashtags': ts_hashtags,
                'card_template': ts.card_template.name if ts.card_template else 'orders',
                'item_type': 'time_slot',
                'slug': ts.slug,
                # TimeSlot-specific fields
                'reserved_time_on_road': ts.reserved_time_on_road,
                'start_location': ts.start_location,
                'cost_of_1_hour_of_work': float(ts.cost_of_1_hour_of_work) if ts.cost_of_1_hour_of_work else 0,
                'minimum_time_slot': ts.minimum_time_slot,
                'user_name': f"{time_slot_owner.first_name} {time_slot_owner.last_name}".strip() if time_slot_owner else None,
                'company_name': company_name
            })
        
        # Get Advertising
        user_advertising = Advertising.objects.filter(
            advertisingownerrelations__user=request.user
        ).select_related(
            'category', 'card_template'
        ).prefetch_related(
            'hashtags'
        )
        
        if category in position_mapping:
            user_advertising = user_advertising.filter(category__name=position_mapping[category])
        
        user_advertising = user_advertising.order_by('-creation_date')
        
        # Add advertising to all_items
        for adv in user_advertising:
            all_items.append({
                'id': adv.id,
                'title': adv.title,
                'description': adv.description,
                'date_start': None,
                'date_end': None,
                'time_start': None,
                'time_end': None,
                'priority': None,
                'status': adv.category.name if adv.category else None,
                'task_mode': adv.adv_mode,
                'note': None,
                'created_at': adv.creation_date.isoformat(),
                'updated_at': adv.publication_date.isoformat(),
                'hashtags': [],
                'card_template': adv.card_template.name if adv.card_template else 'advertising',
                'item_type': 'advertising',
                'slug': adv.slug
            })
        
        # Get JobSearch items
        user_job_searches = JobSearch.objects.filter(
            user=request.user
        ).select_related(
            'category', 'card_template'
        )
        
        if category in position_mapping:
            user_job_searches = user_job_searches.filter(category__name=position_mapping[category])
        
        user_job_searches = user_job_searches.order_by('-last_update')
        
        # Add job searches to all_items
        for js in user_job_searches:
            date_start_str = None
            if js.start_date:
                date_start_str = js.start_date.date().isoformat() if hasattr(js.start_date, 'date') else str(js.start_date).split('T')[0]
            
            all_items.append({
                'id': js.id,
                'title': js.title,
                'description': js.notes,
                'date_start': date_start_str,
                'date_end': None,
                'time_start': js.start_date.isoformat() if js.start_date else None,
                'time_end': None,
                'priority': None,
                'status': js.category.name if js.category else None,
                'task_mode': js.js_mode,
                'note': js.notes,
                'created_at': js.start_date.isoformat() if js.start_date else js.last_update.isoformat(),
                'updated_at': js.last_update.isoformat(),
                'hashtags': [],
                'card_template': js.card_template.name if js.card_template else 'job_search',
                'item_type': 'job_search',
                'slug': js.slug
            })
        
        # Sort all items by creation date
        all_items.sort(key=lambda x: x.get('created_at') or '', reverse=True)
        
        return JsonResponse(all_items, safe=False)
        
    except Exception as e:
        import traceback
        print(f"Error in user_inbox_items: {str(e)}")
        print(traceback.format_exc())
        return JsonResponse({
            'error': f'Error fetching inbox items: {str(e)}'
        }, status=500)


@login_required
def get_edit_data(request, form_type, item_slug):
    """
    Получает данные для редактирования различных типов форм
    """
    print("=" * 50)
    print("DEBUG: get_edit_data function called!")
    print(f"DEBUG: form_type={form_type}, item_slug={item_slug}")
    print(f"DEBUG: User: {request.user}")
    print(f"DEBUG: Request method: {request.method}")
    print(f"DEBUG: Request path: {request.path}")
    print(f"DEBUG: Request URL: {request.build_absolute_uri()}")
    print("=" * 50)
    
    try:
        if form_type == 'my-list':
            print(f"DEBUG: Processing my-list form type for item {item_slug}")
            # Получаем данные задачи
            task = Task.objects.prefetch_related(
                'hashtags', 'performers', 'photos', 'services'
            ).get(slug=item_slug)
            
            print(f"DEBUG: Found task: {task.title}, type: {task.card_template}")
            
            # Проверяем права доступа (только владелец может редактировать)
            if not TaskOwnerRelations.objects.filter(task=task, user=request.user).exists():
                print(f"DEBUG: Access denied for user {request.user} on task {item_slug}")
                return JsonResponse({'success': False, 'error': 'Access denied'})
            
            print(f"DEBUG: Access granted, building data for task {item_slug}")
            
            # Services relation was removed, set to None
            category_id = None
            service_id = None
            print(f"DEBUG: Category ID: {category_id}, Service ID: {service_id}")
            
            data = {
                'title': task.title,
                'description': task.description,
                'category': category_id,
                'service': service_id,
                'status': task.category.name if task.category else None,
                'documents': task.documents,
                'hashtags': [{'tag': tag.tag} for tag in task.hashtags.all()],
                'project_included': None,  # Для задач это поле не используется
                'photos': [photo.photo.url if photo.photo else None for photo in task.photos.all() if photo.photo]
            }
            
            print(f"DEBUG: Built data: {data}")
            
        elif form_type == 'tender':
            # Получаем данные тендера (используем модель Task с типом 'tender')
            task = Task.objects.prefetch_related(
                'hashtags', 'photos'
            ).get(slug=item_slug, card_template__name='tender')
            
            # Проверяем права доступа
            if not TaskOwnerRelations.objects.filter(task=task, user=request.user).exists():
                return JsonResponse({'success': False, 'error': 'Access denied'})
            
            # Services relation was removed
            category_id = None
            service_id = None
            
            data = {
                'title': task.title,
                'description': task.description,
                'category': category_id,
                'service': service_id,
                'status': task.category.name if task.category else None,
                'documents': task.documents,
                'hashtags': [{'tag': tag.tag} for tag in task.hashtags.all()],
                'project_included': None,
                'photos': [task.photo_link] if task.photo_link else []
            }
            
        elif form_type == 'project':
            # Получаем данные проекта (используем модель Task с типом 'project')
            task = Task.objects.prefetch_related(
                'hashtags', 'photos'
            ).get(slug=item_slug, card_template__name='project')
            
            # Проверяем права доступа
            if not TaskOwnerRelations.objects.filter(task=task, user=request.user).exists():
                return JsonResponse({'success': False, 'error': 'Access denied'})
            
            # Services relation was removed
            category_id = None
            service_id = None
            
            data = {
                'title': task.title,
                'description': task.description,
                'category': category_id,
                'service': service_id,
                'status': task.category.name if task.category else None,
                'documents': task.documents,
                'hashtags': [{'tag': tag.tag} for tag in task.hashtags.all()],
                'project_included': None,
                'photos': [photo.photo.url if photo.photo else None for photo in task.photos.all() if photo.photo]
            }
            
        elif form_type == 'advertising':
            print(f"DEBUG: Processing advertising form type for item {item_slug}")
            # Получаем данные рекламы  - advertising uses slug
            advertising = Advertising.objects.select_related(
                'services', 'services__category_name'
            ).prefetch_related(
                'hashtags', 'photos'
            ).get(slug=item_slug)
            
            print(f"DEBUG: Found advertising: {advertising.title}")
            print(f"DEBUG: Advertising services: {advertising.services}")
            print(f"DEBUG: Advertising hashtags count: {advertising.hashtags.count()}")
            print(f"DEBUG: Advertising photos count: {advertising.photos.count()}")
            
            # Проверяем права доступа
            if not AdvertisingOwnerRelations.objects.filter(advertising=advertising, user=request.user).exists():
                print(f"DEBUG: Access denied for user {request.user} on advertising {item_slug}")
                return JsonResponse({'success': False, 'error': 'Access denied'})
            
            print(f"DEBUG: Access granted, building data for advertising {item_slug}")
            
            # Get the service and its category if it exists
            service = advertising.services
            category_id = service.category_name.id if service else None
            service_id = service.id if service else None
            
            print(f"DEBUG: Service: {service}")
            print(f"DEBUG: Category ID: {category_id}, Service ID: {service_id}")
            
            data = {
                'title': advertising.title,
                'description': advertising.description,
                'category': category_id,
                'service': service_id,
                'card_template': advertising.card_template.name if advertising.card_template else None,
                'category': advertising.category.name if advertising.category else None,
                'hashtags': [{'tag': tag.tag} for tag in advertising.hashtags.all()],
                'photos': [{'id': photo.id, 'url': photo.photo.url} if photo.photo else None for photo in advertising.photos.all() if photo.photo]
            }
            
            print(f"DEBUG: Built data: {data}")
            
        elif form_type == 'job-search':
            # Получаем данные поиска работы - job-search uses slug
            job_search = JobSearch.objects.select_related('user').get(slug=item_slug)
            
            # Проверяем права доступа
            if job_search.user != request.user:
                return JsonResponse({'success': False, 'error': 'Access denied'})
            
            data = {
                'title': job_search.title,
                'description': job_search.notes or '',
                'hashtags': [],  # JobSearch не имеет хештегов
                'photos': [],
                'category': None,
                'service': None,
                'status': None,
                'documents': None,
                'performers': [],
                'project_included': None
            }
            
        else:
            return JsonResponse({'success': False, 'error': f'Unknown form type: {form_type}'})
        
        print(f"DEBUG: Returning success response with data for {form_type} {item_slug}")
        return JsonResponse({'success': True, 'data': data})
        
    except Task.DoesNotExist:
        print(f"DEBUG: Task {item_slug} not found")
        return JsonResponse({'success': False, 'error': 'Task not found'})
    except Advertising.DoesNotExist:
        print(f"DEBUG: Advertising {item_slug} not found")
        return JsonResponse({'success': False, 'error': 'Advertising not found'})
    except JobSearch.DoesNotExist:
        print(f"DEBUG: JobSearch {item_slug} not found")
        return JsonResponse({'success': False, 'error': 'Job search not found'})
    except Exception as e:
        print(f"DEBUG: Exception occurred: {str(e)}")
        return JsonResponse({'success': False, 'error': str(e)})


@login_required
def remove_advertising_photo(request, advertising_id, photo_id):
    """
    Удаляет фотографию из рекламного поста
    """
    print(f"DEBUG: remove_advertising_photo called with advertising_id={advertising_id}, photo_id={photo_id}")
    print(f"DEBUG: Request method: {request.method}")
    print(f"DEBUG: User: {request.user}")
    
    try:
        # Проверяем права доступа
        advertising = Advertising.objects.get(id=advertising_id)
        print(f"DEBUG: Found advertising: {advertising.title}")
        
        if not AdvertisingOwnerRelations.objects.filter(advertising=advertising, user=request.user).exists():
            print(f"DEBUG: Access denied for user {request.user} on advertising {advertising_id}")
            return JsonResponse({'success': False, 'error': 'Access denied'})
        
        print(f"DEBUG: Access granted for user {request.user}")
        
        # Находим фотографию
        photo_relation = PhotoRelations.objects.get(id=photo_id)
        print(f"DEBUG: Found photo relation: {photo_relation.id}")
        
        # Проверяем, что фотография принадлежит данному рекламному посту
        if photo_relation in advertising.photos.all():
            print(f"DEBUG: Photo {photo_id} found in advertising {advertising_id}")
            
            # Удаляем связь с рекламным постом
            advertising.photos.remove(photo_relation)
            print(f"DEBUG: Removed photo {photo_id} from advertising {advertising_id}")
            
            # Проверяем, есть ли еще связи с этой фотографией
            # Используем прямой запрос к базе данных
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT COUNT(*) FROM advertising_photos 
                    WHERE photorelations_id = %s
                """, [photo_id])
                remaining_relations = cursor.fetchone()[0]
            
            print(f"DEBUG: Remaining relations for photo {photo_id}: {remaining_relations}")
            
            # Если это единственная связь с фотографией, удаляем саму фотографию
            if remaining_relations == 0:
                photo_relation.delete()
                print(f"DEBUG: Deleted photo relation {photo_id} as it had no more references")
            
            return JsonResponse({'success': True, 'message': 'Photo removed successfully'})
        else:
            print(f"DEBUG: Photo {photo_id} not found in advertising {advertising_id}")
            return JsonResponse({'success': False, 'error': 'Photo not found in this advertising post'})
            
    except Advertising.DoesNotExist:
        print(f"DEBUG: Advertising {advertising_id} not found")
        return JsonResponse({'success': False, 'error': 'Advertising post not found'})
    except PhotoRelations.DoesNotExist:
        print(f"DEBUG: Photo relation {photo_id} not found")
        return JsonResponse({'success': False, 'error': 'Photo not found'})
    except Exception as e:
        print(f"DEBUG: Exception occurred: {str(e)}")
        return JsonResponse({'success': False, 'error': str(e)})


@login_required
@require_http_methods(["PATCH"])
@csrf_exempt
def update_task_status(request, task_slug):
    """Update task status via PATCH request - now uses UserTaskContext"""
    try:
        import json
        from .models import UserTaskContext
        
        task = Task.objects.get(slug=task_slug)
        
        # Get user's context for this task
        try:
            context = UserTaskContext.objects.get(user=request.user, task=task)
        except UserTaskContext.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'You do not have permission to update this task'
            }, status=403)
        
        # Get data from request body
        data = json.loads(request.body)
        new_status = data.get('status')
        
        # Validate status
        valid_statuses = ['inbox', 'backlog', 'agenda', 'waiting', 'someday', 'projects', 'subtask', 'done', 'archive']
        if new_status not in valid_statuses:
            return JsonResponse({
                'success': False,
                'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'
            }, status=400)
        
        # Update UserTaskContext category
        context.category_id = new_status
        
        # Special handling for agenda category
        if new_status == 'agenda':
            task.is_agenda = True
        elif task.is_agenda and new_status not in ['agenda', 'done']:
            # If moving away from agenda, set is_agenda to False
            # EXCEPT for 'done' - it stays in agenda but changes category
            # Archive and all others remove task from agenda
            task.is_agenda = False
        
        # Record completion time when task is marked as done
        if new_status == 'done' and not context.completed_at:
            from django.utils import timezone
            context.completed_at = timezone.now()
        elif new_status != 'done' and context.completed_at:
            # Clear completed_at if moving away from done
            context.completed_at = None
        
        context.save()
        task.save()  # Save task to update is_agenda if changed
        
        # Update parent task metadata if this is a subtask
        if task.parent_id:
            try:
                from .utils import update_parent_subtasks_meta
                parent_task = Task.objects.get(id=task.parent_id)
                update_parent_subtasks_meta(parent_task)
            except Task.DoesNotExist:
                pass
        
        return JsonResponse({
            'success': True,
            'status': new_status,
            'message': f'Task status changed to {new_status} successfully'
        })
        
    except Task.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Task not found'
        }, status=404)
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        import traceback
        print(f"Error updating task status: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@login_required
@require_http_methods(["PATCH"])
@csrf_exempt
def update_task_datetime(request, task_slug):
    """Update task start_datetime and end_datetime via PATCH request (for calendar drag-and-drop)"""
    try:
        import json
        from datetime import datetime
        from django.utils import timezone
        
        task = Task.objects.get(slug=task_slug, taskownerrelations__user=request.user)
        
        # Check if user has permission to update this task
        owner_rel = TaskOwnerRelations.objects.filter(task=task, user=request.user).first()
        if not owner_rel:
            return JsonResponse({
                'success': False,
                'error': 'You do not have permission to update this task'
            }, status=403)
        
        # Get data from request body
        data = json.loads(request.body)
        start_datetime_str = data.get('start_datetime')
        end_datetime_str = data.get('end_datetime')
        all_day = data.get('all_day', False)
        
        # If moving to all_day, clear datetime fields
        if all_day and start_datetime_str is None and end_datetime_str is None:
            task.start_datetime = None
            task.end_datetime = None
        else:
            # Parse and update start_datetime
            if start_datetime_str:
                try:
                    # Parse ISO format datetime string
                    start_dt = datetime.fromisoformat(start_datetime_str.replace('Z', '+00:00'))
                    task.start_datetime = start_dt
                except ValueError as e:
                    return JsonResponse({
                        'success': False,
                        'error': f'Invalid start_datetime format: {e}'
                    }, status=400)
            
            # Parse and update end_datetime
            if end_datetime_str:
                try:
                    # Parse ISO format datetime string
                    end_dt = datetime.fromisoformat(end_datetime_str.replace('Z', '+00:00'))
                    task.end_datetime = end_dt
                except ValueError as e:
                    return JsonResponse({
                        'success': False,
                        'error': f'Invalid end_datetime format: {e}'
                    }, status=400)
        
        task.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Task datetime updated successfully',
            'start_datetime': task.start_datetime.isoformat() if task.start_datetime else None,
            'end_datetime': task.end_datetime.isoformat() if task.end_datetime else None
        })
        
    except Task.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Task not found'
        }, status=404)
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        import traceback
        print(f"Error updating task datetime: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@login_required
@require_http_methods(["PATCH"])
@csrf_exempt
def update_category(request, slug):
    """
    Universal endpoint to update category for any element type (Task, TimeSlot, JobSearch)
    Determines the element type automatically and updates accordingly
    """
    try:
        import json
        
        # Get data from request body
        data = json.loads(request.body)
        new_position = data.get('position')
        
        # Validate position
        valid_positions = ['inbox', 'backlog', 'agenda', 'waiting', 'someday', 'projects', 'done', 'archive']
        if new_position not in valid_positions:
            return JsonResponse({
                'success': False,
                'error': f'Invalid position. Must be one of: {", ".join(valid_positions)}'
            }, status=400)
        
        element = None
        element_type = None
        
        # Try to find Task and its UserTaskContext
        context = None
        try:
            from .models import UserTaskContext
            task = Task.objects.get(slug=slug)
            # Get user's context for this task
            context = UserTaskContext.objects.get(user=request.user, task=task)
            element = task
            element_type = 'task'
        except (Task.DoesNotExist, UserTaskContext.DoesNotExist):
            pass
        
        # Try to find TimeSlot if not found as Task
        if not element:
            try:
                element = TimeSlot.objects.get(slug=slug, timeslotownerrelations__user=request.user)
                element_type = 'timeslot'
                # Check permission
                owner_rel = TimeSlotOwnerRelations.objects.filter(time_slot=element, user=request.user).first()
                if not owner_rel:
                    return JsonResponse({
                        'success': False,
                        'error': 'You do not have permission to update this time slot'
                    }, status=403)
            except TimeSlot.DoesNotExist:
                pass
        
        # Try to find JobSearch if not found as Task or TimeSlot
        if not element:
            try:
                element = JobSearch.objects.get(slug=slug, user=request.user)
                element_type = 'job_search'
            except JobSearch.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'error': 'Element not found'
                }, status=404)
        
        # Update category based on element type
        if element_type == 'task' and context:
            # Update UserTaskContext category for task
            context.category_id = new_position
            
            # Special handling for agenda category
            if new_position == 'agenda':
                element.is_agenda = True
            elif element.is_agenda and new_position not in ['agenda', 'done']:
                # If moving away from agenda, set is_agenda to False
                # EXCEPT for 'done' - it stays in agenda but changes category
                element.is_agenda = False
            
            # Record completion time when task is marked as done
            if new_position == 'done' and not context.completed_at:
                from django.utils import timezone
                context.completed_at = timezone.now()
            elif new_position != 'done' and context.completed_at:
                # Clear completed_at if moving away from done
                context.completed_at = None
            
            context.save()
            element.save()  # Save task to update is_agenda if changed
        else:
            # For TimeSlot and JobSearch, update category directly
            element.category_id = new_position
            element.save()
        
        return JsonResponse({
            'success': True,
            'position': new_position,
            'element_type': element_type,
            'message': f'{element_type.capitalize()} moved to {new_position} successfully'
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        import traceback
        print(f"Error updating category: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@login_required
def get_services_categories(request):
    """
    API endpoint to get all services categories
    """
    try:
        categories = ServicesCategory.objects.all().order_by('id')
        categories_data = [
            {
                'id': category.id,
                'name': category.category_name
            }
            for category in categories
        ]
        
        return JsonResponse({
            'success': True,
            'categories': categories_data
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@login_required
def get_services(request):
    """
    API endpoint to get all services
    Optionally filter by category_id using ?category_id=X
    """
    try:
        category_id = request.GET.get('category_id')
        
        if category_id:
            services = Services.objects.filter(
                category_name_id=category_id
            ).select_related('category_name').order_by('id')
        else:
            services = Services.objects.all().select_related('category_name').order_by('id')
        
        services_data = [
            {
                'id': service.id,
                'name': service.service_name,
                'category_id': service.category_name.id,
                'category_name': service.category_name.category_name
            }
            for service in services
        ]
        
        return JsonResponse({
            'success': True,
            'services': services_data
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@login_required
def get_task_subtasks(request, task_id):
    """Get subtasks for a specific parent task with caching"""
    try:
        from .models import Task, UserTaskContext
        from .utils import get_cached_subtasks
        
        # Verify user has access to parent task
        try:
            parent_task = Task.objects.get(id=task_id)
            UserTaskContext.objects.get(user=request.user, task=parent_task, is_visible=True)
        except (Task.DoesNotExist, UserTaskContext.DoesNotExist):
            return JsonResponse({
                'success': False,
                'error': 'Task not found or access denied'
            }, status=404)
        
        # Get subtasks with caching
        subtasks_data = get_cached_subtasks(task_id, request.user)
        
        return JsonResponse({
            'success': True,
            'subtasks': subtasks_data,
            'count': len(subtasks_data)
        })
        
    except Exception as e:
        import traceback
        print(f"Error in get_task_subtasks: {str(e)}")
        print(traceback.format_exc())
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

