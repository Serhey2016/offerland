from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
import json
from .models import Task
from .forms import TaskForm

def index(request):
    """Главная страница task tracker"""
    return render(request, 'task_tracker/index.html')

@login_required
def dashboard(request):
    """Dashboard with React frontend"""
    return render(request, 'task_tracker/react_dashboard.html')

@login_required
def dashboard_traditional(request):
    """Traditional Django dashboard (fallback)"""
    user_tasks = Task.objects.filter(user=request.user)
    context = {
        'total_tasks': user_tasks.count(),
        'completed_tasks': user_tasks.filter(status='completed').count(),
        'pending_tasks': user_tasks.filter(status='pending').count(),
        'recent_tasks': user_tasks.order_by('-created_at')[:5],
    }
    return render(request, 'task_tracker/dashboard.html', context)

@login_required
def task_list(request):
    """Список всех задач пользователя"""
    tasks = Task.objects.filter(user=request.user).order_by('-created_at')
    context = {
        'tasks': tasks,
    }
    return render(request, 'task_tracker/task_list.html', context)

@login_required
def task_create(request):
    """Создание новой задачи"""
    if request.method == 'POST':
        form = TaskForm(request.POST)
        if form.is_valid():
            task = form.save(commit=False)
            task.user = request.user
            task.save()
            messages.success(request, 'Задача успешно создана!')
            return redirect('task_tracker:task_detail', task_id=task.id)
    else:
        form = TaskForm()
    
    context = {
        'form': form,
    }
    return render(request, 'task_tracker/task_create.html', context)

@login_required
def task_detail(request, task_id):
    """Детальная информация о задаче"""
    task = get_object_or_404(Task, id=task_id, user=request.user)
    context = {
        'task': task,
    }
    return render(request, 'task_tracker/task_detail.html', context)

@login_required
def task_edit(request, task_id):
    """Редактирование задачи"""
    task = get_object_or_404(Task, id=task_id, user=request.user)
    
    if request.method == 'POST':
        form = TaskForm(request.POST, instance=task)
        if form.is_valid():
            form.save()
            messages.success(request, 'Задача успешно обновлена!')
            return redirect('task_tracker:task_detail', task_id=task.id)
    else:
        form = TaskForm(instance=task)
    
    context = {
        'form': form,
        'task': task,
    }
    return render(request, 'task_tracker/task_edit.html', context)

@login_required
def task_delete(request, task_id):
    """Удаление задачи"""
    task = get_object_or_404(Task, id=task_id, user=request.user)
    
    if request.method == 'POST':
        task.delete()
        messages.success(request, 'Задача успешно удалена!')
        return redirect('task_tracker:task_list')
    
    context = {
        'task': task,
    }
    return render(request, 'task_tracker/task_delete.html', context)


# API Views for React Frontend
@login_required
@require_http_methods(["GET"])
def api_tasks(request):
    """API endpoint to get all tasks for the authenticated user"""
    tasks = Task.objects.filter(user=request.user).order_by('-created_at')
    tasks_data = []
    for task in tasks:
        tasks_data.append({
            'id': task.id,
            'title': task.title,
            'description': task.description,
            'status': task.status,
            'priority': task.priority,
            'due_date': task.due_date.isoformat() if task.due_date else None,
            'created_at': task.created_at.isoformat(),
            'updated_at': task.updated_at.isoformat(),
        })
    return JsonResponse({'tasks': tasks_data})


@login_required
@require_http_methods(["GET"])
def api_task_detail(request, task_id):
    """API endpoint to get a specific task"""
    task = get_object_or_404(Task, id=task_id, user=request.user)
    task_data = {
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'status': task.status,
        'priority': task.priority,
        'due_date': task.due_date.isoformat() if task.due_date else None,
        'created_at': task.created_at.isoformat(),
        'updated_at': task.updated_at.isoformat(),
    }
    return JsonResponse({'task': task_data})


@login_required
@require_http_methods(["POST"])
@csrf_exempt
def api_create_task(request):
    """API endpoint to create a new task"""
    try:
        data = json.loads(request.body)
        task = Task.objects.create(
            user=request.user,
            title=data.get('title', ''),
            description=data.get('description', ''),
            status=data.get('status', 'pending'),
            priority=data.get('priority', 'medium'),
            due_date=data.get('due_date') if data.get('due_date') else None,
        )
        return JsonResponse({
            'success': True,
            'task': {
                'id': task.id,
                'title': task.title,
                'description': task.description,
                'status': task.status,
                'priority': task.priority,
                'due_date': task.due_date.isoformat() if task.due_date else None,
                'created_at': task.created_at.isoformat(),
                'updated_at': task.updated_at.isoformat(),
            }
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@login_required
@require_http_methods(["PUT"])
@csrf_exempt
def api_update_task(request, task_id):
    """API endpoint to update a task"""
    try:
        task = get_object_or_404(Task, id=task_id, user=request.user)
        data = json.loads(request.body)
        
        task.title = data.get('title', task.title)
        task.description = data.get('description', task.description)
        task.status = data.get('status', task.status)
        task.priority = data.get('priority', task.priority)
        task.due_date = data.get('due_date') if data.get('due_date') else None
        task.save()
        
        return JsonResponse({
            'success': True,
            'task': {
                'id': task.id,
                'title': task.title,
                'description': task.description,
                'status': task.status,
                'priority': task.priority,
                'due_date': task.due_date.isoformat() if task.due_date else None,
                'created_at': task.created_at.isoformat(),
                'updated_at': task.updated_at.isoformat(),
            }
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@login_required
@require_http_methods(["DELETE"])
@csrf_exempt
def api_delete_task(request, task_id):
    """API endpoint to delete a task"""
    try:
        task = get_object_or_404(Task, id=task_id, user=request.user)
        task.delete()
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@login_required
@require_http_methods(["GET"])
def api_dashboard_stats(request):
    """API endpoint to get dashboard statistics"""
    user_tasks = Task.objects.filter(user=request.user)
    stats = {
        'total_tasks': user_tasks.count(),
        'completed_tasks': user_tasks.filter(status='completed').count(),
        'pending_tasks': user_tasks.filter(status='pending').count(),
        'in_progress_tasks': user_tasks.filter(status='in_progress').count(),
        'high_priority_tasks': user_tasks.filter(priority='high').count(),
        'medium_priority_tasks': user_tasks.filter(priority='medium').count(),
        'low_priority_tasks': user_tasks.filter(priority='low').count(),
    }
    return JsonResponse({'stats': stats})