from django.shortcuts import render
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.utils.http import urlencode
from .models import TypeOfTask, ServicesCategory, Services, TaskStatus, Task, TaskOwnerRelations, Advertising, AdvertisingOwnerRelations, JobSearch
from joblist.models import AllTags, Companies
from django.utils import timezone
import json

# Create your views here.

def testpage(request):
    types = TypeOfTask.objects.all()
    categories = ServicesCategory.objects.all()
    services = Services.objects.all()
    statuses = TaskStatus.objects.all()
    all_tags = json.dumps(list(AllTags.objects.values('id', 'tag')))
    tasks = Task.objects.filter(taskownerrelations__user=request.user) if request.user.is_authenticated else Task.objects.none()
    
    # --- Динамический блок social_feed ---
    # Получаем все элементы Advertising с их владельцами
    advertisings = Advertising.objects.select_related('services', 'type_of_task').prefetch_related('photos', 'hashtags').order_by('-creation_date')
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
    
    # Получаем все записи JobSearch для отображения в потоке
    job_searches_for_feed = JobSearch.objects.select_related('user').order_by('-start_date')
    
    # Создаем список всех элементов для потока (реклама + задачи + job searches)
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
    
    # Сортируем по дате создания (новые сначала)
    feed_items.sort(key=lambda x: x['data'].created_at if x['type'] == 'task' else x['data'].start_date if x['type'] == 'job_search' else x['data']['advertising'].creation_date, reverse=True)
    
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
        title = request.POST.get('title', '').strip()
        company_name = request.POST.get('company_name', '').strip()
        location = request.POST.get('location', '').strip()
        link_to_vacancy = request.POST.get('link_to_vacancy', '').strip()
        job_description = request.POST.get('job_description', '').strip()
        status = request.POST.get('status', 'unsuccessful')
        start_date_str = request.POST.get('start_date', '')
        context = request.POST.get('context', '').strip()
        
        # Валидация обязательных полей
        if not all([title, company_name, location, link_to_vacancy, job_description, start_date_str]):
            return JsonResponse({
                'success': False,
                'error': 'All required fields must be filled'
            }, status=400)
        
        # Парсим дату
        try:
            start_date = timezone.datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))
        except ValueError:
            return JsonResponse({
                'success': False,
                'error': 'Invalid date format'
            }, status=400)
        
        # Получаем или создаем компанию
        company, created = Companies.objects.get_or_create(
            company_name=company_name,
            defaults={
                'description': f'Company created from Job Search activity: {title}'
            }
        )
        
        # Создаем активность
        from .models import Activities
        activity = Activities.objects.create(
            title=title,
            location=location,
            cv_file=request.FILES.get('cv_file'),
            link_to_vacancy=link_to_vacancy,
            job_description=job_description,
            company=company,
            status=status,
            start_date=start_date,
            context=context
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
        return JsonResponse({
            'success': False,
            'error': f'Error adding activity: {str(e)}'
        }, status=500)