from django.contrib import admin
from django.utils.safestring import mark_safe
from .models import (
    Comment, TaskStatus, Category, CardTemplate, ServicesCategory, PhotoRelations, Services, Finance, Task,
    TaskHashtagRelations, AdvertisingHashtagRelations, TimeSlotHashtagRelations, 
    PerformersRelations, CommentTaskRelations, ServicesRelations, TaskOwnerRelations,
    TimeSlot, Advertising, TaskClientRelations, TimeSlotPerformersRelations, CommentTimeSlotRelations,
    CommentAdvertisingRelations, AdvertisingOwnerRelations, JobSearch, Activities, JobSearchActivitiesRelations,
    ActivitiesTaskRelations
)

class TaskHashtagRelationsInline(admin.TabularInline):
    model = TaskHashtagRelations
    extra = 1

class AdvertisingHashtagRelationsInline(admin.TabularInline):
    model = AdvertisingHashtagRelations
    extra = 1

class TimeSlotHashtagRelationsInline(admin.TabularInline):
    model = TimeSlotHashtagRelations
    extra = 1

class PerformersRelationsInline(admin.TabularInline):
    model = PerformersRelations
    extra = 1

class ServicesRelationsInline(admin.TabularInline):
    model = ServicesRelations
    extra = 1

class TaskAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'card_template', 'task_mode', 'category', 'priority', 'created_at', 'is_published', 'is_touchpoint', 'is_agenda', 'is_recurring_display')
    list_filter = ('task_mode', 'category', 'priority', 'card_template', 'is_published', 'is_touchpoint', 'is_agenda', 'created_at')
    search_fields = ('title', 'description')
    readonly_fields = ('created_at', 'updated_at', 'completed_at', 'recurrence_info_display')
    date_hierarchy = 'created_at'
    inlines = [TaskHashtagRelationsInline, PerformersRelationsInline, ServicesRelationsInline]
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('title', 'description', 'card_template', 'task_mode', 'category', 'priority')
        }),
        ('Дополнительная информация', {
            'fields': ('photo_link', 'documents', 'note', 'finance'),
            'classes': ('collapse',)
        }),
        ('Настройки', {
            'fields': ('is_private', 'disclose_name', 'hidden', 'is_published', 'is_touchpoint', 'is_agenda'),
            'classes': ('collapse',)
        }),
        ('Даты и время', {
            'fields': ('start_datetime', 'end_datetime', 'created_at', 'updated_at', 'completed_at'),
            'classes': ('collapse',)
        }),
        ('Повторення (Recurrence)', {
            'fields': ('recurrence_pattern', 'recurrence_info_display'),
            'classes': ('collapse',)
        }),
        ('Связи', {
            'fields': ('parent',),
            'classes': ('collapse',)
        }),
    )
    
    @admin.display(description='Recurring')
    def is_recurring_display(self, obj):
        """Display recurring status in list"""
        return '🔄 Yes' if obj.is_recurring() else 'No'
    
    @admin.display(description='Recurrence Info')
    def recurrence_info_display(self, obj):
        """Display detailed recurrence information"""
        if not obj.is_recurring():
            return 'Not a recurring task'
        
        slots = obj.get_recurrence_slots()
        info = f"<strong>Type:</strong> {obj.get_recurrence_type()}<br>"
        info += f"<strong>Total slots:</strong> {len(slots)}<br><br>"
        
        for i, slot in enumerate(slots, 1):
            info += f"<strong>Slot {i}:</strong> {slot.get('date', 'N/A')} "
            info += f"({slot.get('start_time', 'N/A')} - {slot.get('end_time', 'N/A')})"
            if slot.get('day_label'):
                info += f" - {slot.get('day_label')}"
            info += "<br>"
        
        return mark_safe(info)

class AdvertisingAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'card_template', 'category', 'adv_mode', 'services', 'creation_date', 'publication_date')
    list_filter = ('adv_mode', 'card_template', 'category', 'services', 'creation_date')
    search_fields = ('title', 'description')
    readonly_fields = ('creation_date', 'publication_date')
    date_hierarchy = 'creation_date'
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('title', 'description', 'card_template', 'category', 'adv_mode', 'services')
        }),
        ('Даты', {
            'fields': ('creation_date', 'publication_date'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [AdvertisingHashtagRelationsInline]

class TimeSlotAdmin(admin.ModelAdmin):
    list_display = ('id', 'date_start', 'date_end', 'time_start', 'time_end', 'ts_mode', 'card_template', 'category', 'services', 'cost_of_1_hour_of_work')
    list_filter = ('ts_mode', 'card_template', 'category', 'services', 'date_start', 'date_end')
    search_fields = ('start_location', 'minimum_time_slot')
    readonly_fields = ('id',)
    date_hierarchy = 'date_start'
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('ts_mode', 'card_template', 'category', 'services')
        }),
        ('Даты и время', {
            'fields': ('date_start', 'date_end', 'time_start', 'time_end')
        }),
        ('Детали', {
            'fields': ('reserved_time_on_road', 'start_location', 'cost_of_1_hour_of_work', 'minimum_time_slot'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [TimeSlotHashtagRelationsInline]

class ActivitiesAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'company', 'link_to_vacancy', 'status', 'start_date', 'last_update')
    list_filter = ('status', 'start_date', 'company')
    search_fields = ('title', 'company__company_name', 'link_to_vacancy')
    readonly_fields = ('last_update',)
    date_hierarchy = 'start_date'
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('title', 'company', 'link_to_vacancy', 'status')
        }),
        ('Дополнительная информация', {
            'fields': ('location', 'job_description', 'context', 'cv_file'),
            'classes': ('collapse',)
        }),
        ('Даты', {
            'fields': ('start_date', 'last_update'),
            'classes': ('collapse',)
        }),
    )

class JobSearchActivitiesRelationsAdmin(admin.ModelAdmin):
    list_display = ('id', 'job_search', 'activity', 'get_company_name', 'get_vacancy_link')
    list_filter = ('job_search__user', 'activity__status', 'activity__company')
    search_fields = ('job_search__title', 'activity__title', 'activity__company__company_name')
    
    def get_company_name(self, obj):
        return obj.activity.company.company_name if obj.activity and obj.activity.company else '-'
    get_company_name.short_description = 'Company'
    get_company_name.admin_order_field = 'activity__company__company_name'
    
    def get_vacancy_link(self, obj):
        if obj.activity and obj.activity.link_to_vacancy:
            return f'<a href="{obj.activity.link_to_vacancy}" target="_blank">View</a>'
        return '-'
    get_vacancy_link.short_description = 'Vacancy Link'
    get_vacancy_link.allow_tags = True

admin.site.register(Comment)
admin.site.register(TaskStatus)
admin.site.register(Category)
admin.site.register(CardTemplate)
admin.site.register(ServicesCategory)
admin.site.register(PhotoRelations)
admin.site.register(Services)
admin.site.register(Finance)
admin.site.register(Task, TaskAdmin)
admin.site.register(TaskHashtagRelations)
admin.site.register(AdvertisingHashtagRelations)
admin.site.register(PerformersRelations)
admin.site.register(CommentTaskRelations)
admin.site.register(ServicesRelations)
admin.site.register(TaskOwnerRelations)
admin.site.register(TimeSlot, TimeSlotAdmin)
admin.site.register(Advertising, AdvertisingAdmin)
admin.site.register(TaskClientRelations)
admin.site.register(AdvertisingOwnerRelations)
class JobSearchAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'user', 'post_type', 'js_mode', 'card_template', 'category', 'result_of_task', 'start_date', 'last_update')
    list_filter = ('post_type', 'js_mode', 'card_template', 'category', 'result_of_task', 'start_date', 'user')
    search_fields = ('title', 'notes', 'user__username')
    readonly_fields = ('last_update',)
    date_hierarchy = 'start_date'
    
    fieldsets = (
        ('Основная информація', {
            'fields': ('title', 'user', 'post_type', 'js_mode', 'card_template', 'category', 'result_of_task')
        }),
        ('Дополнительная информация', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
        ('Даты', {
            'fields': ('start_date', 'last_update'),
            'classes': ('collapse',)
        }),
    )

admin.site.register(JobSearch, JobSearchAdmin)

@admin.register(TimeSlotHashtagRelations)
class TimeSlotHashtagRelationsAdmin(admin.ModelAdmin):
    list_display = ('time_slot', 'hashtag')
    list_filter = ('hashtag',)
    search_fields = ('time_slot__date_start', 'hashtag__tag')


@admin.register(TimeSlotPerformersRelations)
class TimeSlotPerformersRelationsAdmin(admin.ModelAdmin):
    list_display = ('time_slot', 'user', 'date')
    list_filter = ('date',)
    search_fields = ('time_slot__date_start', 'user__username')


@admin.register(CommentTimeSlotRelations)
class CommentTimeSlotRelationsAdmin(admin.ModelAdmin):
    list_display = ('comment', 'time_slot')
    search_fields = ('comment__content', 'time_slot__date_start')





@admin.register(CommentAdvertisingRelations)
class CommentAdvertisingRelationsAdmin(admin.ModelAdmin):
    list_display = ('comment', 'advertising')
    search_fields = ('comment__content', 'advertising__title')

@admin.register(ActivitiesTaskRelations)
class ActivitiesTaskRelationsAdmin(admin.ModelAdmin):
    list_display = ('id', 'activity', 'task', 'get_activity_title', 'get_task_title')
    list_filter = ('activity__status', 'activity__company')
    search_fields = ('activity__title', 'task__title', 'activity__company__company_name')
    
    def get_activity_title(self, obj):
        return obj.activity.title if obj.activity and obj.activity.title else '-'
    get_activity_title.short_description = 'Activity Title'
    get_activity_title.admin_order_field = 'activity__title'
    
    def get_task_title(self, obj):
        return obj.task.title if obj.task and obj.task.title else '-'
    get_task_title.short_description = 'Task Title'
    get_task_title.admin_order_field = 'task__title'

# Регистрируем новые модели
admin.site.register(Activities, ActivitiesAdmin)
admin.site.register(JobSearchActivitiesRelations, JobSearchActivitiesRelationsAdmin)
