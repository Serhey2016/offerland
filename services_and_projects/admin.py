from django.contrib import admin
from .models import (
    TypeOfTask, Comment, TaskStatus, ServicesCategory, PhotoRelations, Services, Finance, Task,
    HashtagRelations, PerformersRelations, CommentTaskRelations, ServicesRelations, TaskOwnerRelations,
    TimeSlot, Advertising, TaskClientRelations
)

class HashtagRelationsInline(admin.TabularInline):
    model = HashtagRelations
    extra = 1

class PerformersRelationsInline(admin.TabularInline):
    model = PerformersRelations
    extra = 1

class ServicesRelationsInline(admin.TabularInline):
    model = ServicesRelations
    extra = 1

class TaskAdmin(admin.ModelAdmin):
    inlines = [HashtagRelationsInline, PerformersRelationsInline, ServicesRelationsInline]

admin.site.register(TypeOfTask)
admin.site.register(Comment)
admin.site.register(TaskStatus)
admin.site.register(ServicesCategory)
admin.site.register(PhotoRelations)
admin.site.register(Services)
admin.site.register(Finance)
admin.site.register(Task, TaskAdmin)
admin.site.register(HashtagRelations)
admin.site.register(PerformersRelations)
admin.site.register(CommentTaskRelations)
admin.site.register(ServicesRelations)
admin.site.register(TaskOwnerRelations)
admin.site.register(TimeSlot)
admin.site.register(Advertising)
admin.site.register(TaskClientRelations)
