from django.contrib import admin
from .models import (
    TypeOfTask, Comment, TaskStatus, ServicesCategory, PhotoRelations, Services, Finance, Task,
    TaskHashtagRelations, AdvertisingHashtagRelations, TimeSlotHashtagRelations, 
    PerformersRelations, CommentTaskRelations, ServicesRelations, TaskOwnerRelations,
    TimeSlot, Advertising, TaskClientRelations, TimeSlotPerformersRelations, CommentTimeSlotRelations,
    AdvertisingPerformersRelations, CommentAdvertisingRelations
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


@admin.register(AdvertisingPerformersRelations)
class AdvertisingPerformersRelationsAdmin(admin.ModelAdmin):
    list_display = ('advertising', 'user', 'date')
    list_filter = ('date',)
    search_fields = ('advertising__title', 'user__username')


@admin.register(CommentAdvertisingRelations)
class CommentAdvertisingRelationsAdmin(admin.ModelAdmin):
    list_display = ('comment', 'advertising')
    search_fields = ('comment__content', 'advertising__title')
