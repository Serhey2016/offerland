# pyrhon install django import-export

from import_export import resources, fields, widgets
from import_export.widgets import ForeignKeyWidget, ManyToManyWidget
from import_export.admin import ImportExportModelAdmin
from django.contrib import admin
from django.utils.html import format_html

from .models import (
    Industry, BusinessArea, Country, TownCity, TypeNRating, Route,
    VisasNames, WorkModel, EmploymentType, InterviewStages, AllTags,
    ContractType, Companies, Vacancies
)

class SafeForeignKeyWidget(ForeignKeyWidget):
    def clean(self, value, row=None, *args, **kwargs):
        try:
            return super().clean(value, row, *args, **kwargs)
        except (self.model.DoesNotExist, ValueError):
            return None

class SafeManyToManyWidget(ManyToManyWidget):
    def clean(self, value, row=None, *args, **kwargs):
        if not value:
            return self.model.objects.none()
        values = value.split(self.separator)
        ids = []
        for v in values:
            try:
                obj = self.model.objects.get(**{self.field: v.strip()})
                ids.append(obj.pk)
            except (self.model.DoesNotExist, ValueError):
                continue
        return self.model.objects.filter(pk__in=ids)

class VacanciesResource(resources.ModelResource):
    id_company = fields.Field(
        column_name='company',
        attribute='id_company',
        widget=SafeForeignKeyWidget(Companies, 'company_name')
    )
    
    work_model = fields.Field(
        column_name='work_model',
        attribute='work_model',
        widget=SafeManyToManyWidget(WorkModel, field='name', separator=',')
    )
    
    employment_type = fields.Field(
        column_name='employment_type',
        attribute='employment_type',
        widget=SafeManyToManyWidget(EmploymentType, field='name', separator=',')
    )
    
    contract_type = fields.Field(
        column_name='contract_type',
        attribute='contract_type',
        widget=SafeManyToManyWidget(ContractType, field='contract_type', separator=',')
    )
    
    interview_stages = fields.Field(
        column_name='interview_stages',
        attribute='interview_stages',
        widget=SafeManyToManyWidget(InterviewStages, field='stage', separator=',')
    )
    
    tags = fields.Field(
        column_name='tags',
        attribute='tags',
        widget=SafeManyToManyWidget(AllTags, field='tag', separator=',')
    )
    
    country = fields.Field(
        column_name='country',
        attribute='country',
        widget=SafeForeignKeyWidget(Country, 'countries')
    )
    
    town_city = fields.Field(
        column_name='town_city',
        attribute='town_city',
        widget=SafeForeignKeyWidget(TownCity, 'town_city')
    )

    class Meta:
        model = Vacancies
        skip_unchanged = True
        report_skipped = True
        fields = (
            'id',
            'job_title',
            'id_company',
            'visa_name',
            'dependent_visa_costs',
            'work_model',
            'employment_type',
            'contract_type',
            'salary_1',
            'salary_2',
            'job_description',
            'application_deadline',
            'interview_stages',
            'posting_date',
            'tags',
            'published',
            'url_vacancy',
            'country',
            'town_city'
        )
        import_id_fields = ['id']
        use_transactions = True

    def before_import_row(self, row, **kwargs):
        # Автоматическое создание компании, если она не существует
        company_name = row.get('company')
        if company_name:
            company, created = Companies.objects.get_or_create(
                company_name=company_name.strip(),
                defaults={'legal_name': None}  # Указываем значения по умолчанию для обязательных полей
            )
            row['company'] = company.company_name  # Обновляем значение для корректного связывания

        # Автоматическое создание тегов
        if row.get('tags'):
            for tag_name in row['tags'].split(','):
                tag_name = tag_name.strip()
                if tag_name and not AllTags.objects.filter(tag=tag_name).exists():
                    AllTags.objects.create(tag=tag_name)

@admin.register(Vacancies)
class VacanciesAdmin(ImportExportModelAdmin):
    resource_class = VacanciesResource
    list_display = ('job_title', 'id_company', 'salary_range', 'published', 'posting_date')
    list_filter = ('published', 'id_company', 'country')
    search_fields = ('job_title', 'job_description')
    filter_horizontal = ('work_model', 'employment_type', 'contract_type', 'interview_stages', 'tags')
    
    fields = [
        'job_title',
        'id_company',
        'country',
        'town_city',
        'visa_name',
        'dependent_visa_costs',
        'work_model',
        'employment_type',
        'contract_type',
        'salary_1',
        'salary_2',
        'job_description',
        'application_deadline',
        'interview_stages',
        'posting_date',
        'tags',
        'published',
        'url_vacancy'
    ]
    exclude = ['vacancy_link']

    def salary_range(self, obj):
        if obj.salary_1 and obj.salary_2:
            return f"£{obj.salary_1:,.2f} - £{obj.salary_2:,.2f}"
        elif obj.salary_1:
            return f"£{obj.salary_1:,.2f}"
        return "Not specified"
    salary_range.short_description = 'Salary Range'

    def get_export_queryset(self, request):
        return super().get_export_queryset(request).select_related(
            'id_company', 'country', 'town_city'
        ).prefetch_related(
            'work_model', 'employment_type', 'contract_type', 'interview_stages', 'tags'
        )

# Остальные модели остаются без изменений
@admin.register(Industry)
class IndustryAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(BusinessArea)
class BusinessAreaAdmin(admin.ModelAdmin):
    list_display = ('business_area',)
    search_fields = ('business_area',)

@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ('countries',)
    search_fields = ('countries',)

@admin.register(TownCity)
class TownCityAdmin(admin.ModelAdmin):
    list_display = ('town_city',)
    search_fields = ('town_city',)

@admin.register(TypeNRating)
class TypeNRatingAdmin(admin.ModelAdmin):
    list_display = ('type_n_rating',)
    search_fields = ('type_n_rating',)

@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ('route',)
    search_fields = ('route',)

@admin.register(VisasNames)
class VisasNamesAdmin(admin.ModelAdmin):
    list_display = ('visa_names', 'description')
    search_fields = ('visa_names',)

@admin.register(WorkModel)
class WorkModelAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

@admin.register(EmploymentType)
class EmploymentTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

@admin.register(InterviewStages)
class InterviewStagesAdmin(admin.ModelAdmin):
    list_display = ('stage', 'description')
    search_fields = ('stage',)

@admin.register(AllTags)
class AllTagsAdmin(admin.ModelAdmin):
    list_display = ('tag',)
    search_fields = ('tag',)

@admin.register(ContractType)
class ContractTypeAdmin(admin.ModelAdmin):
    list_display = ('contract_type',)
    search_fields = ('contract_type',)

@admin.register(Companies)
class CompaniesAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'legal_name', 'display_logo', 'contact_email', 'website')
    list_filter = ('industry', 'business_area', 'town_n_city', 'county')
    search_fields = ('company_name', 'legal_name', 'contact_email')
    filter_horizontal = ('industry', 'business_area', 'town_n_city', 'county')
    fieldsets = (
        ('Basic Information', {
            'fields': ('comp_logo', 'company_name', 'legal_name', 'description')
        }),
        ('Classifications', {
            'fields': ('industry', 'business_area')
        }),
        ('Location', {
            'fields': ('town_n_city', 'county', 'route', 'address', 'postcode1', 'postcode2')
        }),
        ('Contact Information', {
            'fields': ('website', 'contact_email', 'contact_number')
        }),
        ('Ratings', {
            'fields': ('career_opportunities_calculated', 'compensation_n_benefits',
                      'culture_n_values', 'senior_management', 'work_life_balance')
        })
    )

    def display_logo(self, obj):
        if obj.comp_logo:
            return format_html('<img src="{}" width="50" height="50" />', obj.comp_logo.url)
        return "No Logo"
    display_logo.short_description = 'Logo'