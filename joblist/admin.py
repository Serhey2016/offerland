from django.contrib import admin

# Register your models here.
from django.utils.html import format_html
from .models import (
    Industry, BusinessArea, Country, TownCity, TypeNRating, Route,
    VisasNames, WorkModel, EmploymentType, InterviewStages, AllTags,
    ContractType, Companies, Vacancies
)

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

@admin.register(Vacancies)
class VacanciesAdmin(admin.ModelAdmin):
    list_display = ('job_title', 'id_company', 'salary_range', 'application_deadline', 'published')
    list_filter = ('published', 'work_model', 'employment_type', 'contract_type', 'posting_date')
    search_fields = ('job_title', 'id_company__company_name', 'job_description')
    filter_horizontal = ('work_model', 'employment_type', 'contract_type', 'interview_stages', 'tags')
    readonly_fields = ('posting_date',)
    fieldsets = (
        ('Basic Information', {
            'fields': ('job_title', 'id_company', 'job_description', 'published')
        }),
        ('Visa Information', {
            'fields': ('visa_name', 'dependent_visa_costs')
        }),
        ('Work Details', {
            'fields': ('work_model', 'employment_type', 'contract_type')
        }),
        ('Compensation', {
            'fields': ('salary_1', 'salary_2')
        }),
        ('Links', {
            'fields': ('vacancy_link', 'url_vacancy')
        }),
        ('Dates', {
            'fields': ('application_deadline', 'posting_date')
        }),
        ('Additional Information', {
            'fields': ('interview_stages', 'tags')
        })
    )

    def salary_range(self, obj):
        if obj.salary_1 and obj.salary_2:
            return f"£{obj.salary_1:,.2f} - £{obj.salary_2:,.2f}"
        elif obj.salary_1:
            return f"£{obj.salary_1:,.2f}"
        return "Not specified"
    salary_range.short_description = 'Salary Range'