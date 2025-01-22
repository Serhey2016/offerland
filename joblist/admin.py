from django.contrib import admin

# Register your models here.
from .models import AllTags, BusinessArea, ContractType, Country, EmploymentType, Industry, InterviewStages, Route, TownCity, TypeNRating, VisasNames, WorkModel, Companies, RelationWorkNUser, Vacancies, UserVacancyRelation

admin.site.register(AllTags)
admin.site.register(BusinessArea)