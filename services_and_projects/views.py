from django.shortcuts import render

# Create your views here.

def testpage(request):
    return render(request, 'services_and_projects/testpage.html', {'title': 'Test Page'})