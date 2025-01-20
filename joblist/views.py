# joblist/views.py

from django.shortcuts import render


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

def joblisting(request):
    context = {
        'title': 'joblist',
        'content': 'list of jobs'
    }
    return render(request, 'joblist/joblistingtemplate.html', context)