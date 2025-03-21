#adminpanel_userside/models.py

from django.db import models
from django.conf import settings
from joblist.models import Companies, InterviewStages
from django_ckeditor_5.fields import CKEditor5Field  # Для CKEditor 5

# Create your models here.
class WorklistStatuses(models.Model):
    status_name = models.CharField("Название статуса", max_length=50)
    description = models.TextField("Описание", blank=True, null=True)

    class Meta:
        db_table = 'worklist_statuses'
        verbose_name = "Статус"
        verbose_name_plural = "Worklist Statuses"

    def __str__(self):
        return self.status_name


class VacanciesFromBoards(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name="Пользователь"
    )
    job_title = models.CharField(
        "Название вакансии",
        max_length=120,
        blank=True,
        null=True,
        help_text="Необязательное значение"
    )
    job_title_link = models.URLField(
        "Ссылка на вакансию",
        blank=True,
        null=True,
        help_text="Необязательное значение"
    )
    company = models.ForeignKey(
        Companies,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Компания (из таблицы Companies)"
    )
    company_outside = models.CharField(
        "Внешнее название компании",
        max_length=80,
        blank=True,
        null=True,
        help_text="Необязательное значение"
    )
    company_link = models.URLField(
        "Ссылка на компанию",
        blank=True,
        null=True,
        help_text="Необязательное значение"
    )
    status = models.ForeignKey(
        WorklistStatuses,
        on_delete=models.PROTECT,
        verbose_name="Статус вакансии"
    )
    interview = models.ManyToManyField(
        InterviewStages,
        blank=True,
        verbose_name="Этапы интервью",
        help_text="Можно выбрать несколько значений из таблицы InterviewStages"
    )
    interview_personal = models.TextField(
        "Персональная информация по интервью",
        blank=True,
        null=True,
        help_text="Необязательное значение"
    )
    date = models.DateField(
        "Дата",
        help_text="Укажите дату (день, месяц, год)"
    )
    email = models.CharField(
        "Email",
        max_length=70,
        help_text="Текст до 70 символов"
    )
    cv_file = models.FileField(
        "CV (файл)",
        upload_to='user_data/cv_files/',
        blank=True,
        null=True,
        help_text="Необязательное значение"
    )
    cv_text = models.TextField(
        "CV (текст)",
        blank=True,
        null=True,
        help_text="Необязательное значение"
    )
    cover_letter = models.TextField(
        "Сопроводительное письмо",
        blank=True,
        null=True,
        help_text="Необязательное значение"
    )
    vacancy_description = models.TextField(
        "Описание вакансии",
        help_text="Текстовое описание вакансии"
    )
    notes = models.TextField(
        "Заметки",
        blank=True,
        null=True,
        help_text="Необязательное поле для добавления заметок"
    )

    class Meta:
        db_table = 'vacancies_from_boards'
        verbose_name = "Вакансия с доски"
        verbose_name_plural = "Vacancies From Boards"

    def __str__(self):
        return self.job_title if self.job_title else f"Vacancy {self.id}"
    
    
    
