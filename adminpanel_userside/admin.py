
from django.contrib import admin
from .models import VacanciesFromBoards, WorklistStatuses


# Настройка админки для WorklistStatuses
@admin.register(WorklistStatuses)
class WorklistStatusesAdmin(admin.ModelAdmin):
    list_display = ('id', 'status_name', 'description')  # Отображаемые колонки в списке
    search_fields = ('status_name',)  # Возможность поиска по названию статуса
    list_filter = ('status_name',)  # Фильтр по названию статуса


# Настройка админки для VacanciesFromBoards
@admin.register(VacanciesFromBoards)
class VacanciesFromBoardsAdmin(admin.ModelAdmin):
    list_display = ('id', 'job_title', 'user', 'company', 'status', 'date', 'notes')  # Поля, которые будут отображаться в списке
    search_fields = ('job_title', 'company', 'notes')  # Возможность поиска по названию вакансии, компании и заметкам
    list_filter = ('status', 'date')  # Возможность фильтровать по статусу и дате
    readonly_fields = ('id',)  # Поля, которые нельзя редактировать
    fieldsets = (  # Группировка полей в форме редактирования
        ('Общая информация', {
            'fields': ('user', 'job_title', 'job_title_link', 'company', 'company_outside', 'company_link')
        }),
        ('Детали вакансии', {
            'fields': ('status', 'interview', 'interview_personal', 'date')
        }),
        ('Контакты и документы', {
            'fields': ('email', 'cv_file', 'cv_text', 'cover_letter')
        }),
        ('Дополнительно', {
            'fields': ('notes', 'vacancy_description')
        }),
    )
