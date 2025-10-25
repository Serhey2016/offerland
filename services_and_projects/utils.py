"""
Utility functions for services_and_projects app
"""
from django.db import transaction
from django.contrib.auth import get_user_model

User = get_user_model()


def anonymize_user_and_preserve_tasks(user):
    """
    GDPR-compliant user deletion that preserves delegated tasks
    
    This function:
    1. Anonymizes tasks created by the user
    2. Removes the user's personal task contexts
    3. Preserves tasks that are shared with other users
    4. Deletes tasks that only the user has access to
    
    Args:
        user: The User instance to be deleted
        
    Returns:
        dict: Statistics about the deletion process
    """
    from .models import Task, UserTaskContext
    
    stats = {
        'tasks_anonymized': 0,
        'tasks_deleted': 0,
        'contexts_removed': 0,
        'tasks_preserved': 0,
    }
    
    with transaction.atomic():
        # 1. Find all tasks where user is the creator (through UserTaskContext with role='owner')
        creator_contexts = UserTaskContext.objects.filter(
            user=user,
            role='owner'
        ).select_related('task')
        
        for context in creator_contexts:
            task = context.task
            
            # Anonymize creator information
            task.creator = None
            task.creator_deleted = True
            task.creator_display_name = f"[Deleted User #{user.id}]"
            task.save()
            stats['tasks_anonymized'] += 1
            
            # Check if other users have this task
            other_contexts = UserTaskContext.objects.filter(task=task).exclude(user=user)
            
            if other_contexts.exists():
                # Task has other users - keep task, remove creator's context
                context.delete()
                stats['tasks_preserved'] += 1
                stats['contexts_removed'] += 1
            else:
                # No other users - delete the entire task
                task.delete()  # This will cascade delete the context
                stats['tasks_deleted'] += 1
        
        # 2. For tasks where user is assignee/collaborator (not owner)
        assignee_contexts = UserTaskContext.objects.filter(
            user=user
        ).exclude(role='owner')
        
        # Just remove user's context, keep task for others
        assignee_count = assignee_contexts.count()
        assignee_contexts.delete()
        stats['contexts_removed'] += assignee_count
        
        # 3. Note: Actual user deletion should be done by the caller
        # This function only handles task-related cleanup
    
    return stats


def delegate_task_to_user(task, from_user, to_user, category='backlog'):
    """
    Delegate a task to another user
    
    Args:
        task: The Task instance to delegate
        from_user: The User delegating the task
        to_user: The User receiving the delegation
        category: The initial category for the delegated task (default: 'backlog')
        
    Returns:
        UserTaskContext: The created context for the delegated user
    """
    from .models import UserTaskContext
    
    # Create a new context for the user receiving the delegation
    context, created = UserTaskContext.objects.get_or_create(
        user=to_user,
        task=task,
        defaults={
            'category_id': category,
            'role': 'assignee',
            'delegated_by': from_user,
            'is_visible': True,
        }
    )
    
    if not created:
        # If context already exists, update the delegation info
        context.delegated_by = from_user
        context.is_visible = True
        context.save()
    
    return context


def get_user_task_statistics(user):
    """
    Get task statistics for a user
    
    Args:
        user: The User instance
        
    Returns:
        dict: Statistics about the user's tasks
    """
    from .models import UserTaskContext
    
    contexts = UserTaskContext.objects.filter(user=user, is_visible=True)
    
    stats = {
        'total_tasks': contexts.count(),
        'by_category': {},
        'by_role': {},
        'completed_tasks': contexts.filter(completed_at__isnull=False).count(),
        'delegated_tasks': contexts.filter(delegated_by__isnull=False).count(),
    }
    
    # Count by category
    for context in contexts:
        if context.category:
            category_name = context.category.name
            stats['by_category'][category_name] = stats['by_category'].get(category_name, 0) + 1
    
    # Count by role
    for context in contexts:
        role = context.role
        stats['by_role'][role] = stats['by_role'].get(role, 0) + 1
    
    return stats


def update_parent_subtasks_meta(parent_task):
    """Update lightweight metadata in parent task"""
    from .models import Task, UserTaskContext, Category, TaskHashtagRelations
    from django.core.cache import cache
    from django.utils import timezone
    
    if not parent_task:
        return
    
    # Count total and completed subtasks
    subtasks = Task.objects.filter(parent_id=parent_task.id)
    total_count = subtasks.count()
    
    # Count completed subtasks via UserTaskContext
    try:
        done_category = Category.objects.get(name='done')
        completed_count = UserTaskContext.objects.filter(
            task__parent_id=parent_task.id,
            category=done_category,
            is_visible=True
        ).count()
    except Category.DoesNotExist:
        completed_count = 0
    
    parent_task.subtasks_meta = {
        'count': total_count,
        'completed_count': completed_count,
        'last_updated': timezone.now().isoformat()
    }
    parent_task.save(update_fields=['subtasks_meta'])
    
    # Invalidate cache for this parent's subtasks
    invalidate_subtasks_cache(parent_task.id)


def invalidate_subtasks_cache(parent_id):
    """Invalidate cached subtasks for a parent task"""
    from django.core.cache import cache
    cache.delete(f'subtasks_{parent_id}')


def get_cached_subtasks(parent_id, user):
    """Get subtasks with caching"""
    from django.core.cache import cache
    from .models import Task, UserTaskContext, TaskHashtagRelations
    
    cache_key = f'subtasks_{parent_id}'
    cached_data = cache.get(cache_key)
    
    if cached_data:
        return cached_data
    
    # Fetch from database
    subtasks_contexts = UserTaskContext.objects.filter(
        user=user,
        task__parent_id=parent_id,
        is_visible=True
    ).select_related(
        'task',
        'task__card_template',
        'category'
    ).prefetch_related(
        'task__hashtags'
    ).order_by('-task__created_at')
    
    subtasks_data = []
    for context in subtasks_contexts:
        task = context.task
        
        # Get hashtags
        hashtag_relations = TaskHashtagRelations.objects.filter(task=task).select_related('hashtag')
        hashtags = [{'id': rel.hashtag.id, 'tag_name': rel.hashtag.tag} for rel in hashtag_relations]
        
        # Format dates
        date_start_str = task.start_datetime.date().isoformat() if task.start_datetime else None
        date_end_str = task.end_datetime.date().isoformat() if task.end_datetime else None
        
        subtask_data = {
            'id': task.id,
            'slug': task.slug,
            'title': task.title,
            'description': task.description,
            'date_start': date_start_str,
            'date_end': date_end_str,
            'priority': task.priority,
            'status': context.category.name if context.category else None,
            'created_at': task.created_at.isoformat(),
            'updated_at': task.updated_at.isoformat(),
            'completed_at': context.completed_at.isoformat() if context.completed_at else None,
            'hashtags': hashtags,
            'parent_id': task.parent_id
        }
        subtasks_data.append(subtask_data)
    
    # Cache for 5 minutes
    cache.set(cache_key, subtasks_data, 300)
    
    return subtasks_data

