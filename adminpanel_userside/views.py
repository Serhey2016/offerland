from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, get_user_model
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
