from django.contrib import admin
from .models import (
    TypeOfTask, Comment, TaskStatus, ServicesCategory, PhotoRelations, Services, Finance, Task,
    TaskHashtagRelations, AdvertisingHashtagRelations, TimeSlotHashtagRelations, 
    PerformersRelations, CommentTaskRelations, ServicesRelations, TaskOwnerRelations,
    TimeSlot, Advertising, TaskClientRelations, TimeSlotPerformersRelations, CommentTimeSlotRelations,
    CommentAdvertisingRelations, AdvertisingOwnerRelations, JobSearch, Activities, JobSearchActivitiesRelations
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
    inlines = [TaskHashtagRelationsInline, PerformersRelationsInline, ServicesRelationsInline]

class AdvertisingAdmin(admin.ModelAdmin):
    inlines = [AdvertisingHashtagRelationsInline]

class TimeSlotAdmin(admin.ModelAdmin):
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

admin.site.register(TypeOfTask)
admin.site.register(Comment)
admin.site.register(TaskStatus)
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
admin.site.register(JobSearch)

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

# Регистрируем новые модели
admin.site.register(Activities, ActivitiesAdmin)
admin.site.register(JobSearchActivitiesRelations, JobSearchActivitiesRelationsAdmin)
