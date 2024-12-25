# joblist/views.py

from django.shortcuts import render
from django.http import HttpResponse

def joblist(request, category_name=None):
    if category_name:
        return HttpResponse(f"Список вакансій у категорії: {category_name}")
    else:
        return HttpResponse("Список всіх вакансій")  # Або логіка для відображення всіх вакансій

def detail(request, job_id):
    return HttpResponse(f"Детальна інформація про вакансію з ID: {job_id}")