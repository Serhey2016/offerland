# joblist/views.py

from django.shortcuts import render
from django.db.models import Q
from .models import Vacancies, Companies, TownCity, EmploymentType, WorkModel, ContractType, VisasNames
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
   



# def joblisting(request):
#     vacancies_list = Vacancies.objects.select_related('id_company').all()
#     paginator = Paginator(vacancies_list, 5)  # 5 вакансий на страницу
    
#     page = request.GET.get('page', 1)
    
#     try:
#         page_obj = paginator.page(page)
#     except PageNotAnInteger:
#         page_obj = paginator.page(1)
#     except EmptyPage:
#         page_obj = paginator.page(paginator.num_pages)

#     context = {
#         'page_obj': page_obj,
#     }
#     return render(request, 'joblist/joblistingtemplate.html', context)


def joblisting(request):
    # Get all the filter parameters from the request
    job_title = request.GET.get('job_title')
    company_name = request.GET.get('company_name')
    town_city = request.GET.get('town_city')
    employment_type = request.GET.get('employment_type')
    work_model = request.GET.get('work_model')
    contract_type = request.GET.get('contract_type')
    visa_name = request.GET.get('visa_name')

    # Start with all vacancies
    vacancies_list = Vacancies.objects.select_related('id_company', 'town_city').all()

    # Apply filters if they are provided
    if job_title:
        vacancies_list = vacancies_list.filter(job_title__icontains=job_title)
    
    if company_name:
        vacancies_list = vacancies_list.filter(id_company__company_name__icontains=company_name)
    
    if town_city and town_city != 'Town city':
        vacancies_list = vacancies_list.filter(town_city_id=town_city)
    
    if employment_type and employment_type != 'Employment type':
        vacancies_list = vacancies_list.filter(employment_type__id=employment_type)
    
    if work_model and work_model != 'Work model':
        vacancies_list = vacancies_list.filter(work_model__id=work_model)
    
    if contract_type and contract_type != 'Contract type':
        vacancies_list = vacancies_list.filter(contract_type__id=contract_type)
    
    if visa_name and visa_name != 'Visa name':
        vacancies_list = vacancies_list.filter(visa_name_id=visa_name)

        # Проверяем, есть ли результаты
    no_results = not vacancies_list.exists()
    
    # Pagination
    paginator = Paginator(vacancies_list, 5)
    page = request.GET.get('page', 1)
    
    try:
        page_obj = paginator.page(page)
    except PageNotAnInteger:
        page_obj = paginator.page(1)
    except EmptyPage:
        page_obj = paginator.page(paginator.num_pages)

    # Get all options for select fields
    context = {
        'page_obj': page_obj,
        'town_cities': TownCity.objects.all(),
        'employment_types': EmploymentType.objects.all(),
        'work_models': WorkModel.objects.all(),
        'contract_types': ContractType.objects.all(),
        'visa_names': VisasNames.objects.all(),
        # Preserve search parameters
        'search_params': request.GET,
        'no_results': no_results, 
    }
    return render(request, 'joblist/joblistingtemplate.html', context)