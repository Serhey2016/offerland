from django.core.management.base import BaseCommand
from services_and_projects.models import Task
from services_and_projects.utils import update_parent_subtasks_meta


class Command(BaseCommand):
    help = 'Populate subtasks_meta for all existing parent tasks'

    def handle(self, *args, **options):
        # Find all tasks that have subtasks (are parents)
        parent_task_ids = Task.objects.filter(
            subtasks__isnull=False
        ).distinct().values_list('id', flat=True)
        
        total = len(parent_task_ids)
        self.stdout.write(f"Found {total} parent tasks to update")
        
        for i, parent_id in enumerate(parent_task_ids, 1):
            try:
                parent_task = Task.objects.get(id=parent_id)
                update_parent_subtasks_meta(parent_task)
                
                if i % 10 == 0:
                    self.stdout.write(f"Processed {i}/{total} tasks")
            except Task.DoesNotExist:
                pass
        
        self.stdout.write(self.style.SUCCESS(f'Successfully populated subtasks_meta for {total} parent tasks'))

