from django.db import models
from django.contrib.auth import get_user_model
from django.conf import settings
from joblist.models import AllTags, Companies
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver
import uuid

def generate_uuid():
    return uuid.uuid4()

User = get_user_model()


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
    name = models.CharField(max_length=32, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Task Status"
        verbose_name_plural = "Task Statuses"


class Category(models.Model):
    """Unified position/status for all elements (Task, JobSearch, TimeSlot, etc.)"""
    POSITION_CHOICES = [
        ('inbox', 'Inbox'),
        ('backlog', 'Backlog'),
        ('agenda', 'Agenda'),
        ('waiting', 'Waiting'),
        ('someday', 'Someday'),
        ('projects', 'Projects'),
        ('subtask', 'Subtask'),
        ('done', 'Done'),
        ('archive', 'Archive'),
    ]
    
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=15, choices=POSITION_CHOICES, unique=True)
    
    def __str__(self):
        return self.get_name_display()
    
    class Meta:
        db_table = 'category'
        verbose_name = "Category"
        verbose_name_plural = "Categories"


class CardTemplate(models.Model):
    """Unified card template for all view elements (Task, JobSearch, TimeSlot, Advertising, etc.)"""
    TEMPLATE_CHOICES = [
        ('tender', 'Tender'),
        ('project', 'Project'),
        ('advertising', 'Advertising'),
        ('orders', 'Orders'),
        ('timeslot', 'TimeSlot'),
        ('timeslot_public', 'TimeSlot Public'),
        ('job_search', 'Job Search'),
        ('task', 'Task'),
    ]
    
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=20, choices=TEMPLATE_CHOICES, unique=True)
    
    def __str__(self):
        return self.get_name_display()
    
    class Meta:
        db_table = 'card_template'
        verbose_name = "Card Template"
        verbose_name_plural = "Card Templates"


class ServicesCategory(models.Model):
    id = models.AutoField(primary_key=True)
    category_name = models.CharField(max_length=100, unique=True)

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
    TASK_MODE_CHOICES = [
        ('draft', 'Draft'),
        ('moderation', 'Moderation'),
        ('published', 'Published'),
        ('in_progress', 'In Progress'),
        ('in_review', 'In Review'),
        ('completed', 'Completed'),
        ('rejected', 'Rejected'),
        ('canceled', 'Сanceled'),
    ]
    
    PRIORITY_CHOICES = [
        ('iu', 'Important & Urgent'),
        ('inu', 'Important & Not Urgent'),
        ('niu', 'Not Important & Urgent'),
        ('ninu', 'Not Important & Not Urgent'),
    ]
    
    id = models.AutoField(primary_key=True)
    uuid = models.UUIDField(default=generate_uuid, unique=True, editable=False)
    slug = models.SlugField(max_length=255, blank=True, null=True, unique=True)
    card_template = models.ForeignKey('CardTemplate', on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Card template', to_field='name', db_column='card_template')
    title = models.CharField(max_length=120)
    description = models.TextField(max_length=5000, blank=True, null=True)
    photo_link = models.CharField(max_length=2000, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    start_datetime = models.DateTimeField(null=True, blank=True, verbose_name='Start Date & Time')
    end_datetime = models.DateTimeField(null=True, blank=True, verbose_name='End Date & Time')
    documents = models.CharField(max_length=2000, blank=True, null=True)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, null=True, blank=True, verbose_name='Priority')
    task_mode = models.CharField(max_length=15, choices=TASK_MODE_CHOICES, default='draft', verbose_name='Task mode')
    is_private = models.BooleanField(default=False)
    disclose_name = models.BooleanField(default=False)
    is_published = models.BooleanField(default=False)
    is_touchpoint = models.BooleanField(default=False)
    is_agenda = models.BooleanField(default=False)
    note = models.TextField(max_length=10000, blank=True, null=True)
    finance = models.ForeignKey('Finance', on_delete=models.SET_NULL, null=True, blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subtasks')
    subtasks_meta = models.JSONField(
        null=True,
        blank=True,
        default=None,
        help_text='Lightweight metadata about subtasks for quick display'
    )
    
    # Creator fields for GDPR compliance
    creator = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_tasks',
        verbose_name='Task Creator'
    )
    creator_deleted = models.BooleanField(default=False, verbose_name='Creator Account Deleted')
    creator_display_name = models.CharField(max_length=100, blank=True, null=True, verbose_name='Creator Display Name')
    
    # Recurrence pattern для повторюваних подій
    recurrence_pattern = models.JSONField(
        null=True, 
        blank=True,
        verbose_name='Recurrence Pattern',
        help_text='JSON structure for recurring events with different time slots per day',
        default=None
    )
    
    # Связи многие ко многим через промежуточные таблицы
    hashtags = models.ManyToManyField('joblist.AllTags', through='TaskHashtagRelations', blank=True)
    photos = models.ManyToManyField('PhotoRelations', blank=True, related_name='tasks')

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            # Short slug: "t-{uuid[:8]}" (11 chars total)
            self.slug = f"t-{self.uuid.hex[:8]}"
        
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return f"/task/{self.slug}/"
    
    # Helper методи для роботи з повтореннями
    def is_recurring(self):
        """Перевіряє, чи є таска повторюваною"""
        return self.recurrence_pattern is not None and \
               isinstance(self.recurrence_pattern, dict) and \
               'slots' in self.recurrence_pattern and \
               len(self.recurrence_pattern['slots']) > 0
    
    def get_recurrence_slots(self):
        """Повертає список часових слотів для повторюваної події"""
        if not self.is_recurring():
            return []
        return self.recurrence_pattern.get('slots', [])
    
    def get_recurrence_type(self):
        """Повертає тип повторення (daily, weekly, custom, etc.)"""
        if not self.is_recurring():
            return None
        return self.recurrence_pattern.get('type', 'custom')
    
    def add_recurrence_slot(self, date, start_time, end_time, **extra_data):
        """Додає новий часовий слот до повторення"""
        if self.recurrence_pattern is None:
            self.recurrence_pattern = {'type': 'custom', 'slots': []}
        
        slot = {
            'date': str(date),
            'start_time': str(start_time),
            'end_time': str(end_time),
            **extra_data
        }
        
        if 'slots' not in self.recurrence_pattern:
            self.recurrence_pattern['slots'] = []
        
        self.recurrence_pattern['slots'].append(slot)
        
    def clear_recurrence(self):
        """Очищає всі дані про повторення"""
        self.recurrence_pattern = None

    class Meta:
        verbose_name = "Task"
        verbose_name_plural = "Tasks"
        indexes = [
            models.Index(fields=['parent', 'created_at']),
        ]

    def delete(self, *args, **kwargs):
        related_photos = list(self.photos.all())
        super().delete(*args, **kwargs)
        for photo in related_photos:
            photo.delete()


class TaskHashtagRelations(models.Model):
    id = models.AutoField(primary_key=True)
    task = models.ForeignKey('Task', on_delete=models.CASCADE)
    hashtag = models.ForeignKey('joblist.AllTags', on_delete=models.CASCADE)

    class Meta:
        db_table = 'task_hashtag_relations'
        unique_together = ('task', 'hashtag')
        verbose_name = "Task hashtag relation"
        verbose_name_plural = "Task hashtag relations"


class AdvertisingHashtagRelations(models.Model):
    id = models.AutoField(primary_key=True)
    advertising = models.ForeignKey('Advertising', on_delete=models.CASCADE)
    hashtag = models.ForeignKey('joblist.AllTags', on_delete=models.CASCADE)

    class Meta:
        db_table = 'advertising_hashtag_relations'
        unique_together = ('advertising', 'hashtag')
        verbose_name = "Advertising hashtag relation"
        verbose_name_plural = "Advertising hashtag relations"


class TimeSlotHashtagRelations(models.Model):
    id = models.AutoField(primary_key=True)
    time_slot = models.ForeignKey('TimeSlot', on_delete=models.CASCADE)
    hashtag = models.ForeignKey('joblist.AllTags', on_delete=models.CASCADE)

    class Meta:
        db_table = 'timeslot_hashtag_relations'
        unique_together = ('time_slot', 'hashtag')
        verbose_name = "TimeSlot hashtag relation"
        verbose_name_plural = "TimeSlot hashtag relations"


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


class UserTaskContext(models.Model):
    """Personal context for each user's view of a task"""
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='task_contexts')
    task = models.ForeignKey('Task', on_delete=models.CASCADE, related_name='user_contexts')
    
    category = models.ForeignKey(
        'Category', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        verbose_name='Personal Category',
        to_field='name', 
        db_column='category'
    )
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name='Completed At')
    personal_note = models.TextField(max_length=10000, blank=True, null=True, verbose_name='Personal Notes')
    
    delegated_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='delegated_tasks',
        verbose_name='Delegated By'
    )
    delegated_at = models.DateTimeField(auto_now_add=True, verbose_name='Delegated At')
    
    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('assignee', 'Assignee'),
        ('collaborator', 'Collaborator'),
    ]
    role = models.CharField(max_length=15, choices=ROLE_CHOICES, default='assignee', verbose_name='Role')
    is_visible = models.BooleanField(default=True, verbose_name='Visible')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.task.title} ({self.get_role_display()})"
    
    class Meta:
        db_table = 'user_task_context'
        unique_together = ('user', 'task')
        verbose_name = "User Task Context"
        verbose_name_plural = "User Task Contexts"
        indexes = [
            models.Index(fields=['user', 'category']),
            models.Index(fields=['user', 'is_visible']),
        ]


class TaskPublication(models.Model):
    """Public marketplace listing for tasks"""
    PUBLICATION_TYPE_CHOICES = [
        ('business', 'Business Services'),
        ('personal', 'Personal Support'),
    ]
    
    DELIVERY_TYPE_CHOICES = [
        ('online', 'Online (Remote)'),
        ('offline', 'Offline (Visiting)'),
        ('hybrid', 'Hybrid'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('expired', 'Expired'),
    ]
    
    id = models.AutoField(primary_key=True)
    uuid = models.UUIDField(default=generate_uuid, unique=True, editable=False)
    slug = models.SlugField(max_length=255, blank=True, null=True, unique=True)
    
    task = models.ForeignKey('Task', on_delete=models.CASCADE, related_name='publications')
    publisher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='task_publications', verbose_name='Publisher')
    
    publication_type = models.CharField(max_length=20, choices=PUBLICATION_TYPE_CHOICES, verbose_name='Publication Type')
    service = models.ForeignKey('Services', on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Service')
    service_category = models.ForeignKey('ServicesCategory', on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Service Category')
    
    hashtags = models.ManyToManyField('joblist.AllTags', through='TaskPublicationHashtagRelations', blank=True)
    
    delivery_type = models.CharField(max_length=20, choices=DELIVERY_TYPE_CHOICES, verbose_name='Delivery Type')
    payment_methods = models.JSONField(default=list, verbose_name='Payment Methods')
    payment_types = models.JSONField(default=list, verbose_name='Payment Types')
    
    public_title = models.CharField(max_length=120, verbose_name='Public Title')
    public_description = models.TextField(max_length=5000, blank=True, null=True, verbose_name='Public Description')
    location = models.CharField(max_length=200, blank=True, null=True, verbose_name='Location')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', verbose_name='Status')
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Created At')
    published_at = models.DateTimeField(null=True, blank=True, verbose_name='Published At')
    expires_at = models.DateTimeField(null=True, blank=True, verbose_name='Expires At')
    
    views_count = models.IntegerField(default=0, verbose_name='Views Count')
    
    def __str__(self):
        return f"{self.public_title} ({self.get_publication_type_display()})"
    
    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(f"pub-{self.uuid.hex[:8]}")
        
        # Auto-set published_at when status changes to active
        if self.status == 'active' and not self.published_at:
            from django.utils import timezone
            self.published_at = timezone.now()
        
        super().save(*args, **kwargs)
    
    def get_absolute_url(self):
        pub_type = 'business' if self.publication_type == 'business' else 'personal'
        return f"/marketplace/{pub_type}/{self.slug}/"
    
    class Meta:
        db_table = 'task_publications'
        verbose_name = "Task Publication"
        verbose_name_plural = "Task Publications"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['publisher', 'status']),
            models.Index(fields=['publication_type', 'status']),
        ]


class TaskPublicationHashtagRelations(models.Model):
    id = models.AutoField(primary_key=True)
    publication = models.ForeignKey('TaskPublication', on_delete=models.CASCADE)
    hashtag = models.ForeignKey('joblist.AllTags', on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'task_publication_hashtag_relations'
        unique_together = ('publication', 'hashtag')
        verbose_name = "Task Publication Hashtag Relation"
        verbose_name_plural = "Task Publication Hashtag Relations"


class TimeSlot(models.Model):
    TS_MODE_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]
    
    id = models.AutoField(primary_key=True)
    uuid = models.UUIDField(default=generate_uuid, unique=True, editable=False)
    slug = models.SlugField(max_length=255, blank=True, null=True)  # Removed unique=True initially
    date_start = models.DateField()
    date_end = models.DateField()
    time_start = models.TimeField()
    time_end = models.TimeField()
    hashtags = models.ManyToManyField('joblist.AllTags', through='TimeSlotHashtagRelations', blank=True)
    reserved_time_on_road = models.IntegerField()  # В минутах
    start_location = models.CharField(max_length=100)  # Почтовый индекс
    cost_of_1_hour_of_work = models.DecimalField(max_digits=10, decimal_places=2)  # В центах
    minimum_time_slot = models.CharField(max_length=50)  # Изменено на CharField
    
    card_template = models.ForeignKey('CardTemplate', on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Card template', to_field='name', db_column='card_template')
    services = models.ForeignKey('Services', on_delete=models.CASCADE)
    category = models.ForeignKey('Category', on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Category', to_field='name', db_column='category')
    ts_mode = models.CharField(max_length=10, choices=TS_MODE_CHOICES, default='draft', verbose_name='Time slot mode')
    
    # Добавляем связи многие ко многим через промежуточные таблицы
    performers = models.ManyToManyField(User, through='TimeSlotPerformersRelations', blank=True)
    comments = models.ManyToManyField('Comment', through='CommentTimeSlotRelations', blank=True)
    photos = models.ManyToManyField('PhotoRelations', blank=True, related_name='time_slots')

    def __str__(self):
        return f"TimeSlot {self.date_start} - {self.date_end}"

    def save(self, *args, **kwargs):
        if not self.slug:
            # Генерируем slug на основе даты и времени
            from django.utils.text import slugify
            from datetime import datetime, date, time
            
            # Convert to date/time objects if they are strings
            if isinstance(self.date_start, str):
                from django.utils.dateparse import parse_date
                date_obj = parse_date(self.date_start)
                date_str = date_obj.strftime('%Y-%m-%d') if date_obj else self.date_start
            else:
                date_str = self.date_start.strftime('%Y-%m-%d')
            
            if isinstance(self.time_start, str):
                from django.utils.dateparse import parse_time
                time_obj = parse_time(self.time_start)
                time_str = time_obj.strftime('%H-%M') if time_obj else self.time_start.replace(':', '-')
            else:
                time_str = self.time_start.strftime('%H-%M')
            
            self.slug = slugify(f"timeslot-{date_str}-{time_str}-{self.uuid.hex[:8]}")
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return f"/post/timeslot/{self.slug}/"

    def get_uuid_short(self):
        return str(self.uuid)[:8]

    class Meta:
        db_table = 'time_slots'
        verbose_name = "time slot"
        verbose_name_plural = "time slots"

    def delete(self, *args, **kwargs):
        related_photos = list(self.photos.all())
        super().delete(*args, **kwargs)
        for photo in related_photos:
            photo.delete()


class Advertising(models.Model):
    ADV_MODE_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]
    
    id = models.AutoField(primary_key=True)
    uuid = models.UUIDField(default=generate_uuid, unique=True, editable=False)
    slug = models.SlugField(max_length=255, blank=True, null=True)  # Removed unique=True initially
    title = models.CharField(max_length=120)
    description = models.TextField(max_length=5000, blank=True, null=True, default='')
    hashtags = models.ManyToManyField('joblist.AllTags', through='AdvertisingHashtagRelations', blank=True)
    services = models.ForeignKey('Services', on_delete=models.CASCADE, null=True, blank=True)
    
    card_template = models.ForeignKey('CardTemplate', on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Card template', to_field='name', db_column='card_template')
    category = models.ForeignKey('Category', on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Category', to_field='name', db_column='category')
    photos = models.ManyToManyField('PhotoRelations', blank=True, related_name='advertisings')
    creation_date = models.DateTimeField(auto_now_add=True, verbose_name='Creation date')
    publication_date = models.DateTimeField(auto_now_add=True, verbose_name='Publication date')
    adv_mode = models.CharField(max_length=10, choices=ADV_MODE_CHOICES, default='draft', verbose_name='Advertising mode')
    
    # Связи многие ко многим через промежуточные таблицы
    comments = models.ManyToManyField('Comment', through='CommentAdvertisingRelations', blank=True)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            # Генерируем slug на основе заголовка
            from django.utils.text import slugify
            self.slug = slugify(f"advertising-{self.title}-{self.uuid.hex[:8]}")
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return f"/post/advertising/{self.slug}/"

    def get_uuid_short(self):
        return str(self.uuid)[:8]

    class Meta:
        db_table = 'advertising'
        verbose_name = "Advertising feed"
        verbose_name_plural = "Advertising feeds"

    def delete(self, *args, **kwargs):
        related_photos = list(self.photos.all())
        super().delete(*args, **kwargs)
        for photo in related_photos:
            photo.delete()


# Промежуточные таблицы для TimeSlot
class TimeSlotPerformersRelations(models.Model):
    id = models.AutoField(primary_key=True)
    time_slot = models.ForeignKey('TimeSlot', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'timeslot_performers_relations'
        unique_together = ('time_slot', 'user')
        verbose_name = "TimeSlot performer relation"
        verbose_name_plural = "TimeSlot performer relations"


class CommentTimeSlotRelations(models.Model):
    id = models.AutoField(primary_key=True)
    comment = models.ForeignKey('Comment', on_delete=models.CASCADE)
    time_slot = models.ForeignKey('TimeSlot', on_delete=models.CASCADE)

    class Meta:
        db_table = 'comment_timeslot_relations'
        unique_together = ('comment', 'time_slot')
        verbose_name = "Comment to the time slot"
        verbose_name_plural = "Comment time slot relations"





class CommentAdvertisingRelations(models.Model):
    id = models.AutoField(primary_key=True)
    comment = models.ForeignKey('Comment', on_delete=models.CASCADE)
    advertising = models.ForeignKey('Advertising', on_delete=models.CASCADE)

    class Meta:
        db_table = 'comment_advertising_relations'
        unique_together = ('comment', 'advertising')
        verbose_name = "Comment to the advertising"
        verbose_name_plural = "Comment advertising relations"


class AdvertisingOwnerRelations(models.Model):
    id = models.AutoField(primary_key=True)
    advertising = models.ForeignKey('Advertising', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        db_table = 'advertising_owner_relations'
        unique_together = ('advertising', 'user')
        verbose_name = "Advertising owner relation"
        verbose_name_plural = "Advertising owner relations"

class TimeSlotOwnerRelations(models.Model):
    id = models.AutoField(primary_key=True)
    time_slot = models.ForeignKey('TimeSlot', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        db_table = 'timeslot_owner_relations'
        unique_together = ('time_slot', 'user')
        verbose_name = "TimeSlot owner relation"
        verbose_name_plural = "TimeSlot owner relations"


class TaskClientRelations(models.Model):
    id = models.AutoField(primary_key=True)
    task = models.ForeignKey('Task', on_delete=models.CASCADE)
    client = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        db_table = 'task_client_relations'
        unique_together = ('task', 'client')
        verbose_name = "Task Client relation"
        verbose_name_plural = "Task Client relations"


class JobSearch(models.Model):
    JS_MODE_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]
    
    id = models.AutoField(primary_key=True)
    uuid = models.UUIDField(default=generate_uuid, unique=True, editable=False)
    slug = models.SlugField(max_length=255, blank=True, null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='job_searches')
    title = models.CharField(max_length=60)
    start_date = models.DateTimeField(blank=True, null=True)
    last_update = models.DateTimeField(auto_now=True)
    notes = models.TextField(blank=True, null=True)
    
    POST_TYPE_CHOICES = [
        ('job_search', 'Job Search'),
        ('vacancy_post', 'Vacancy Post'),
        ('resume_post', 'Resume Post'),
        ('networking', 'Networking'),
        ('skill_share', 'Skill Share'),
        ('project_showcase', 'Project Showcase'),
        ('industry_news', 'Industry News'),
        ('career_advice', 'Career Advice'),
        ('other', 'Other'),
    ]
    
    RESULT_CHOICES = [
        ('find_job', 'Find job'),
        ('not_find', 'Not find'),
    ]
    
    result_of_task = models.CharField(max_length=10, choices=RESULT_CHOICES, default='not_find')
    js_mode = models.CharField(max_length=10, choices=JS_MODE_CHOICES, default='draft', verbose_name='Job search mode')
    post_type = models.CharField(max_length=20, choices=POST_TYPE_CHOICES, default='job_search', verbose_name='Post type')
    card_template = models.ForeignKey('CardTemplate', on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Card template', to_field='name', db_column='card_template')
    category = models.ForeignKey('Category', on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Category', to_field='name', db_column='category')
    
    # Связь многие ко многим с Activities через промежуточную таблицу
    activities = models.ManyToManyField('Activities', through='JobSearchActivitiesRelations', blank=True)

    def __str__(self):
        return f"Job Search: {self.title} by {self.user}"

    def save(self, *args, **kwargs):
        if not self.slug:
            # Generate slug based on title and UUID
            from django.utils.text import slugify
            self.slug = slugify(f"jobsearch-{self.title}-{self.uuid.hex[:8]}")
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return f"/post/jobsearch/{self.slug}/"

    def get_uuid_short(self):
        return str(self.uuid)[:8]

    class Meta:
        db_table = 'job_search'
        verbose_name = "Job Search"
        verbose_name_plural = "Job Searches"


class Activities(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=60, blank=True, default='')
    location = models.CharField(max_length=120, blank=True, default='')
    cv_file = models.FileField(upload_to='user_data/cv_files/', max_length=2097152, blank=True, null=True)  # 2MB = 2,097,152 bytes
    link_to_vacancy = models.CharField(max_length=3000)  # Обязательное поле
    job_description = models.TextField(blank=True, default='')
    company = models.ForeignKey(Companies, on_delete=models.CASCADE, to_field='id_company')  # Обязательное поле
    
    STATUS_CHOICES = [
        ('successful', 'Successful'),
        ('unsuccessful', 'Unsuccessful'),
        ('canceled', 'Archive'),
    ]
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default='unsuccessful', blank=True)
    
    start_date = models.DateTimeField(blank=True, null=True)
    last_update = models.DateTimeField(auto_now=True)
    context = models.CharField(max_length=2000, blank=True, default='')
    
    # Связи многие ко многим через промежуточные таблицы
    tasks = models.ManyToManyField('Task', through='ActivitiesTaskRelations', blank=True)

    def __str__(self):
        return f"Activity: {self.title} at {self.company}"

    class Meta:
        db_table = 'activities'
        verbose_name = "Activity"
        verbose_name_plural = "Activities"


class JobSearchActivitiesRelations(models.Model):
    id = models.AutoField(primary_key=True)
    job_search = models.ForeignKey(JobSearch, on_delete=models.CASCADE)
    activity = models.ForeignKey(Activities, on_delete=models.CASCADE)

    class Meta:
        db_table = 'job_search_n_activities'
        unique_together = ('job_search', 'activity')
        verbose_name = "Job Search Activity relation"
        verbose_name_plural = "Job Search Activity relations"


class ActivitiesTaskRelations(models.Model):
    id = models.AutoField(primary_key=True)
    activity = models.ForeignKey(Activities, on_delete=models.CASCADE)
    task = models.ForeignKey(Task, on_delete=models.CASCADE)

    class Meta:
        db_table = 'activities_n_task'
        unique_together = ('activity', 'task')
        verbose_name = "Activity Task relation"
        verbose_name_plural = "Activity Task relations"


@receiver(post_delete, sender=PhotoRelations)
def delete_photo_file(sender, instance, **kwargs):
    if instance.photo:
        instance.photo.delete(save=False)


@receiver(post_save, sender=Task)
def invalidate_parent_subtasks_cache_on_save(sender, instance, **kwargs):
    """Invalidate subtasks cache when a subtask is created or updated"""
    if instance.parent_id:
        from .utils import invalidate_subtasks_cache
        invalidate_subtasks_cache(instance.parent_id)


@receiver(post_delete, sender=Task)
def invalidate_parent_subtasks_cache_on_delete(sender, instance, **kwargs):
    """Invalidate subtasks cache when a subtask is deleted"""
    if instance.parent_id:
        from .utils import invalidate_subtasks_cache
        invalidate_subtasks_cache(instance.parent_id)


