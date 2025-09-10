from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from .models import Task
from .forms import TaskForm

def index(request):
    """Главная страница task tracker"""
    return render(request, 'task_tracker/index.html')

@login_required
def dashboard(request):
    """Дашборд пользователя с обзором задач"""
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