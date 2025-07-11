from django.shortcuts import render
from .models import TypeOfTask, ServicesCategory, Services, TaskStatus
from joblist.models import AllTags
import json

# Create your views here.

def testpage(request):
    types = TypeOfTask.objects.all()
    categories = ServicesCategory.objects.all()
    services = Services.objects.all()
    statuses = TaskStatus.objects.all()
    all_tags = json.dumps(list(AllTags.objects.values('id', 'tag')))
    return render(request, 'services_and_projects/testpage.html', {
        'title': 'Test Page',
        'types': types,
        'categories': categories,
        'services': services,
        'statuses': statuses,
        'all_tags': all_tags,
    })