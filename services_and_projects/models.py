from django.db import models
from django.contrib.auth import get_user_model
from django.conf import settings
from joblist.models import AllTags

User = get_user_model()

class TypeOfTask(models.Model):
    id = models.AutoField(primary_key=True)
    type_of_task_name = models.CharField(max_length=15, unique=True)

    def __str__(self):
        return self.type_of_task_name

    class Meta:
        verbose_name = "Type of task"
        verbose_name_plural = "Type of tasks"


def create_initial_data(apps, schema_editor):
    TypeOfTask = apps.get_model('your_app', 'TypeOfTask')
    data_list = [
        "My list", "Tender", "Project", "Advertising", "Time Slot", "Job search"
    ]
    for idx, name in enumerate(data_list, start=1):
        TypeOfTask.objects.get_or_create(id=idx, defaults={'type_of_task_name': name})




class Comment(models.Model):
    id = models.AutoField(primary_key=True)
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='comments',
        verbose_name="Автор"
    )
    content = models.CharField(
        max_length=300,
        verbose_name="Context"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Created_date"
    )
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies',
        verbose_name="Parent"
    )

    def __str__(self):
        return f"Comment from {self.author} — {self.content[:30]}..."

    class Meta:
        verbose_name = "Comment"
        verbose_name_plural = "Comments"
        ordering = ['-created_at']


class TaskStatus(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=18, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Task Status"
        verbose_name_plural = "Task Statuses"


class ServicesCategory(models.Model):
    id = models.AutoField(primary_key=True)
    category_name = models.CharField(max_length=25, unique=True)

    def __str__(self):
        return self.category_name

    class Meta:
        verbose_name = "Services Category"
        verbose_name_plural = "Services Categories"


class PhotoRelations(models.Model):
    id = models.AutoField(primary_key=True)
    photo = models.ImageField(upload_to='user_data/services_photos/', null=True, blank=True)  # разрешаем null и blank

    class Meta:
        db_table = 'photo_relations'
        verbose_name = "Photo Relation"
        verbose_name_plural = "Photos"


class Services(models.Model):
    id = models.AutoField(primary_key=True)
    category_name = models.ForeignKey('ServicesCategory', on_delete=models.CASCADE)
    service_name = models.CharField(max_length=120)
    hashtags = models.ManyToManyField('joblist.AllTags', blank=True)

    def __str__(self):
        return self.service_name

    class Meta:
        db_table = 'services'
        verbose_name = "Service"
        verbose_name_plural = "Services"


class Finance(models.Model):
    id = models.AutoField(primary_key=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    
    def __str__(self):
        return f"{self.amount} {self.currency}"

    class Meta:
        verbose_name = "Finance"
        verbose_name_plural = "Finances"


class Task(models.Model):
    id = models.AutoField(primary_key=True)
    type_of_task = models.ForeignKey('TypeOfTask', on_delete=models.CASCADE)
    title = models.CharField(max_length=120)
    description = models.TextField(max_length=5000)
    photo_link = models.CharField(max_length=2000, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    date_start = models.DateField(null=True, blank=True)
    date_end = models.DateField(null=True, blank=True)
    time_start = models.TimeField(null=True, blank=True)
    time_end = models.TimeField(null=True, blank=True)
    documents = models.CharField(max_length=2000, blank=True, null=True)
    status = models.ForeignKey('TaskStatus', on_delete=models.SET_NULL, null=True)
    is_private = models.BooleanField(default=False)
    hide_project = models.BooleanField(default=False)
    disclose_name = models.BooleanField(default=False)
    hidden_task = models.BooleanField(default=False)
    is_published = models.BooleanField(default=False)
    note = models.TextField(max_length=10000, blank=True, null=True)
    finance = models.ForeignKey('Finance', on_delete=models.SET_NULL, null=True, blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subtasks')
    
    # Связи многие ко многим через промежуточные таблицы
    hashtags = models.ManyToManyField('joblist.AllTags', through='HashtagRelations', blank=True)
    performers = models.ManyToManyField(User, through='PerformersRelations', blank=True)
    comments = models.ManyToManyField('Comment', through='CommentTaskRelations', blank=True)
    photos = models.ManyToManyField('PhotoRelations', blank=True, related_name='tasks')
    services = models.ManyToManyField('Services', through='ServicesRelations', blank=True)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "Task"
        verbose_name_plural = "Tasks"


class HashtagRelations(models.Model):
    id = models.AutoField(primary_key=True)
    task = models.ForeignKey('Task', on_delete=models.CASCADE)
    hashtag = models.ForeignKey('joblist.AllTags', on_delete=models.CASCADE)

    class Meta:
        db_table = 'hashtag_relations'
        unique_together = ('task', 'hashtag')
        verbose_name = "Linking a task to a tag"
        verbose_name_plural = "Linking a task to a tags"


class PerformersRelations(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    task = models.ForeignKey('Task', on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'performers_relations'
        unique_together = ('user', 'task')
        verbose_name = "Task Performer relation"
        verbose_name_plural = "Task Performer relations"


class CommentTaskRelations(models.Model):
    id = models.AutoField(primary_key=True)
    comment = models.ForeignKey('Comment', on_delete=models.CASCADE)
    task = models.ForeignKey('Task', on_delete=models.CASCADE)

    class Meta:
        db_table = 'comment_task_relations'
        unique_together = ('comment', 'task')
        verbose_name = "Comment to the task"
        verbose_name_plural = "Comment tasks relations"


class ServicesRelations(models.Model):
    id = models.AutoField(primary_key=True)
    service = models.ForeignKey('Services', on_delete=models.CASCADE)
    task = models.ForeignKey('Task', on_delete=models.CASCADE)

    class Meta:
        db_table = 'services_relations'
        unique_together = ('service', 'task')
        verbose_name = "Services relation"
        verbose_name_plural = "Services relations"


class TaskOwnerRelations(models.Model):
    id = models.AutoField(primary_key=True)
    task = models.ForeignKey('Task', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        db_table = 'task_owner_relations'
        unique_together = ('task', 'user')
        verbose_name = "Task owner relation"
        verbose_name_plural = "Task owner relations"


class TimeSlot(models.Model):
    id = models.AutoField(primary_key=True)
    date_start = models.DateField()
    date_end = models.DateField()
    time_start = models.TimeField()
    time_end = models.TimeField()
    hashtags = models.ManyToManyField('joblist.AllTags', blank=True)
    reserved_time_on_road = models.IntegerField()  # В минутах
    start_location = models.CharField(max_length=100)  # Почтовый индекс
    cost_of_1_hour_of_work = models.DecimalField(max_digits=10, decimal_places=2)  # В центах
    minimum_time_slot = models.CharField(max_length=50)  # Изменено на CharField
    type_of_task = models.ForeignKey('TypeOfTask', on_delete=models.CASCADE)  # Добавлена связь с TypeOfTask
    services = models.ForeignKey('Services', on_delete=models.CASCADE)

    def __str__(self):
        return f"Слот {self.date_start} - {self.date_end}"

    class Meta:
        db_table = 'time_slots'
        verbose_name = "time slot"
        verbose_name_plural = "time slots"


class Advertising(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=120)
    description = models.TextField(max_length=5000)
    hashtags = models.ManyToManyField('joblist.AllTags', blank=True)
    services = models.ForeignKey('Services', on_delete=models.CASCADE)
    type_of_task = models.ForeignKey('TypeOfTask', on_delete=models.CASCADE)  # Добавлена связь с TypeOfTask
    photos = models.ManyToManyField('PhotoRelations', blank=True, related_name='advertisings')

    def __str__(self):
        return self.title

    class Meta:
        db_table = 'advertising'
        verbose_name = "Advertising feed"
        verbose_name_plural = "Advertising feeds"


class TaskClientRelations(models.Model):
    id = models.AutoField(primary_key=True)
    task = models.ForeignKey('Task', on_delete=models.CASCADE)
    client = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        db_table = 'task_client_relations'
        unique_together = ('task', 'client')
        verbose_name = "Task Client relation"
        verbose_name_plural = "Task Client relations"


