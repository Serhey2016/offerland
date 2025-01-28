# joblist/views.py

from django.shortcuts import render
from .models import Vacancies, Companies 
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

# def joblist(request, category_name=None):
#     if category_name:
#         return HttpResponse(f"Список вакансій у категорії: {category_name}")
#     else:
#         return HttpResponse("Список всіх вакансій")  # Або логіка для відображення всіх вакансій

# def detail(request, job_id):
#     return HttpResponse(f"Детальна інформація про вакансію з ID: {job_id}")

def jobdetails(request):
    context = {
        'title': 'Our contacts',
        'content': 'Our contacts'
    }
    return render(request, 'joblist/jobdetails.html', context)

# def joblisting(request):
#     vacancies = Vacancies.objects.all() 
#     context = {
#         'vacancies': vacancies 
#     }
#     return render(request, 'joblist/joblistingtemplate.html', context)
   



def joblisting(request):
    vacancies_list = Vacancies.objects.select_related('id_company').all()
    paginator = Paginator(vacancies_list, 5)  # 5 вакансий на страницу
    
    page = request.GET.get('page', 1)
    
    try:
        page_obj = paginator.page(page)
    except PageNotAnInteger:
        page_obj = paginator.page(1)
    except EmptyPage:
        page_obj = paginator.page(paginator.num_pages)

    context = {
        'page_obj': page_obj,
    }
    return render(request, 'joblist/joblistingtemplate.html', context)

