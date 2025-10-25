from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, get_user_model
from django.contrib.auth.models import Group
from django.http import JsonResponse
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from blog.models import AllArticles, BlogCategory
from joblist.models import AllTags
from adminpanel_userside.forms import AllArticlesForm
from blog.models import AllArticles 
from django.shortcuts import render, redirect, get_object_or_404

# Імпорт для вакансій, що знаходяться в adminpanel_userside.models
from .models import VacanciesFromBoards, WorklistStatuses

# Імпорт для статей і категорій з додатку blog, а також тегів з joblist
from blog.models import AllArticles, BlogCategory
from joblist.models import AllTags

# Імпорт для модерації тасок
from services_and_projects.models import Task


@login_required(login_url='adminpanel_userside:login')
def control_panel_main_f(request):
    return render(request, 'adminpanel_userside/control_panel_main.html')


def vacancies_from_boards(request):
    vacancies = VacanciesFromBoards.objects.all()
    statuses = WorklistStatuses.objects.all()
    context = {
        'title': 'Vacancies from Boards',
        'vacancies': vacancies,
        'statuses': statuses,
        'update_vacancy_url': reverse('adminpanel_userside:update_vacancy'),
    }
    return render(request, 'adminpanel_userside/vfromjboard.html', context)


@csrf_exempt
def update_vacancy(request):
    if request.method == 'POST':
        vacancy_id = request.POST.get('id')
        field = request.POST.get('field')

        try:
            vacancy = VacanciesFromBoards.objects.get(id=vacancy_id)
            if field == 'job_title':
                vacancy.job_title = request.POST.get('job_title')
                vacancy.job_title_link = request.POST.get('job_title_link')
            elif field == 'status':
                status_id = request.POST.get('status')
                if status_id:
                    vacancy.status_id = status_id
            vacancy.save()
            return JsonResponse({'success': True})
        except VacanciesFromBoards.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Vacancy not found'})
    return JsonResponse({'success': False, 'error': 'Invalid request method'})


def login_view(request):
    if request.method == 'POST':
        email = request.POST.get('username')  # Поле форми 'username' містить email
        password = request.POST.get('password')
        user = authenticate(request, email=email, password=password)
        if user is not None and user.is_active:
            login(request, user)
            return redirect('adminpanel_userside:control_panel_main_f')
        else:
            messages.error(request, 'Invalid email or password.')
    return render(request, 'adminpanel_userside/login_form.html')


def register(request):
    if request.method == 'POST':
        username      = request.POST.get('username')
        first_name    = request.POST.get('first_name')
        last_name     = request.POST.get('last_name')
        email         = request.POST.get('email')
        password      = request.POST.get('password')
        password_check= request.POST.get('PasswordCheck')

        if password != password_check:
            messages.error(request, "Пароли не совпадают.")
        else:
            User = get_user_model()
            if User.objects.filter(username=username).exists():
                messages.error(request, "Пользователь с таким username уже существует.")
            elif User.objects.filter(email=email).exists():
                messages.error(request, "Пользователь с таким email уже существует.")
            else:
                user = User.objects.create_user(username=username, email=email, password=password)
                user.first_name = first_name
                user.last_name = last_name
                user.save()
                messages.success(request, "Регистрация прошла успешно. Теперь вы можете авторизоваться.")
                return redirect('adminpanel_userside:login')
    return render(request, 'adminpanel_userside/register.html')


@login_required(login_url='adminpanel_userside:login')
def articles_page(request):
    category_id = request.GET.get('category')
    if category_id:
        try:
            selected_category = BlogCategory.objects.get(id=category_id)
            articles = AllArticles.objects.filter(category=selected_category)
        except BlogCategory.DoesNotExist:
            selected_category = None
            articles = AllArticles.objects.none()
    else:
        selected_category = None
        articles = AllArticles.objects.all()

    categories = BlogCategory.objects.all()
    
    context = {
        'categories': categories,
        'selected_category': selected_category,
        'articles': articles,
    }
    return render(request, 'adminpanel_userside/articlespage.html', context)


@login_required(login_url='adminpanel_userside:login')
def edit_article(request, article_id):
    # Получаем объект статьи или возвращаем 404, если не найден
    article = get_object_or_404(AllArticles, id=article_id)
    
    # Если используется форма (например, AllArticlesForm), то:
    if request.method == 'POST':
        form = AllArticlesForm(request.POST, request.FILES, instance=article)
        if form.is_valid():
            edited_article = form.save(commit=False)
            edited_article.creator = request.user  # при необходимости
            if edited_article.is_published and not edited_article.published_date:
                edited_article.published_date = timezone.now()
            edited_article.save()
            form.save_m2m()
            return redirect('adminpanel_userside:articles_page')
    else:
        form = AllArticlesForm(instance=article)
    
    context = {
        'form': form,
        'article': article,
    }
    return render(request, 'adminpanel_userside/edit_article.html', context)


@login_required
def create_article(request):
    if request.method == 'POST':
        form = AllArticlesForm(request.POST, request.FILES)
        if form.is_valid():
            article = form.save(commit=False)
            article.creator = request.user
            if article.is_published:
                article.published_date = timezone.now()
            article.save()
            form.save_m2m()  # Збереження зв'язків для ManyToMany поля (теги)
            return redirect('adminpanel_userside:articles_page')
    else:
        form = AllArticlesForm()

    context = {
        'form': form,
    }
    return render(request, 'adminpanel_userside/create_article.html', context)


# Moderation Views
@login_required(login_url='adminpanel_userside:login')
def moderation_list_view(request):
    """
    List view of all tasks in moderation status
    Only accessible by users in the 'Moderators' group
    """
    # Check if user is in Moderators group
    if not request.user.groups.filter(name='Moderators').exists() and not request.user.is_superuser:
        messages.error(request, 'Access denied. You must be a moderator to access this page.')
        return redirect('adminpanel_userside:control_panel_main_f')
    
    # Query tasks in moderation mode
    tasks = Task.objects.filter(task_mode='moderation').order_by('-created_at')
    
    # Create demo tasks if none exist (for mockup purposes)
    if not tasks.exists():
        demo_tasks = [
            {
                'title': 'Need a professional website designer',
                'description': 'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage.',
                'category': 'Business Support'
            },
            {
                'title': 'Looking for a Python developer',
                'description': 'The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form.',
                'category': 'Business Support'
            },
            {
                'title': 'Help with house cleaning',
                'description': 'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don\'t look even slightly believable.',
                'category': 'Personal Support'
            },
            {
                'title': 'Personal fitness trainer needed',
                'description': 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters.',
                'category': 'Personal Support'
            },
            {
                'title': 'Social media marketing expert',
                'description': 'All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures.',
                'category': 'Business Support'
            },
        ]
        
        for demo in demo_tasks:
            Task.objects.create(
                title=demo['title'],
                description=demo['description'],
                task_mode='moderation',
                creator=request.user,
                note=f"Category: {demo['category']}"
            )
        
        # Re-query after creating demo tasks
        tasks = Task.objects.filter(task_mode='moderation').order_by('-created_at')
    
    context = {
        'title': 'Task Moderation',
        'tasks': tasks,
    }
    return render(request, 'adminpanel_userside/moderation_list.html', context)


@login_required(login_url='adminpanel_userside:login')
def moderation_detail_view(request, task_id):
    """
    Detail view for a specific task in moderation
    Allows moderators to approve or decline the task
    """
    # Check if user is in Moderators group
    if not request.user.groups.filter(name='Moderators').exists() and not request.user.is_superuser:
        messages.error(request, 'Access denied. You must be a moderator to access this page.')
        return redirect('adminpanel_userside:control_panel_main_f')
    
    # Get the task or return 404
    task = get_object_or_404(Task, id=task_id)
    
    context = {
        'title': 'Task Moderation - Detail',
        'task': task,
    }
    return render(request, 'adminpanel_userside/moderation_detail.html', context)
