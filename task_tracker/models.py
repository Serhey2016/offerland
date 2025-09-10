from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class Task(models.Model):
    """Модель задачи"""
    
    STATUS_CHOICES = [
        ('pending', 'В ожидании'),
        ('in_progress', 'В работе'),
        ('completed', 'Завершено'),
        ('cancelled', 'Отменено'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Низкий'),
        ('medium', 'Средний'),
        ('high', 'Высокий'),
        ('urgent', 'Срочный'),
    ]
    
    title = models.CharField(max_length=200, verbose_name='Название')
    description = models.TextField(blank=True, verbose_name='Описание')
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending',
        verbose_name='Статус'
    )
    priority = models.CharField(
        max_length=10, 
        choices=PRIORITY_CHOICES, 
        default='medium',
        verbose_name='Приоритет'
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='task_tracker_tasks', verbose_name='Пользователь')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Обновлено')
    due_date = models.DateTimeField(null=True, blank=True, verbose_name='Срок выполнения')
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name='Завершено')
    
    class Meta:
        verbose_name = 'Задача'
        verbose_name_plural = 'Задачи'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        # Автоматически устанавливаем дату завершения при изменении статуса
        if self.status == 'completed' and not self.completed_at:
            self.completed_at = timezone.now()
        elif self.status != 'completed' and self.completed_at:
            self.completed_at = None
        super().save(*args, **kwargs)

class TaskComment(models.Model):
    """Модель комментариев к задачам"""
    
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments', verbose_name='Задача')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='task_tracker_comments', verbose_name='Пользователь')
    content = models.TextField(verbose_name='Содержание')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано')
    
    class Meta:
        verbose_name = 'Комментарий'
        verbose_name_plural = 'Комментарии'
        ordering = ['created_at']
    
    def __str__(self):
        return f'Комментарий к задаче "{self.task.title}" от {self.user.username}'