# CustomUser Model - Документация по использованию

## Описание

Создана кастомная модель пользователя `CustomUser` для работы с UK-бизнес пользователями, включающая все необходимые поля для работы в Великобритании.

## Основные поля

### Обязательные поля
- `username` - уникальное имя пользователя
- `email` - email адрес (автоматически приводится к нижнему регистру)
- `password` - пароль
- `first_name` - имя (обязательное)
- `last_name` - фамилия (обязательное)

### UK-специфичные поля
- `utr` - Unique Taxpayer Reference (10 цифр)
- `company_number` - номер компании (8 цифр)
- `company_name` - название компании
- `website` - веб-сайт компании

### Адресные поля
- `country` - страна (по умолчанию GB)
- `postal_code` - почтовый индекс
- `city` - город

### Контактная информация
- `phone_number` - номер телефона
- `avatar` - аватар пользователя

### Дополнительные поля
- `is_verified` - подтвержден ли email
- `api_key` - уникальный ключ для API
- `date_joined` - дата регистрации
- `updated_at` - дата последнего обновления

## UserProfile модель

Дополнительная модель для расширенной информации о пользователе:

### Бизнес информация
- `business_type` - тип бизнеса (Sole Trader, Partnership, Limited Company, LLP, Other)
- `industry` - отрасль
- `company_size` - размер компании (1-10, 11-50, 51-200, 201-500, 500+)

### Настройки уведомлений
- `email_notifications` - email уведомления
- `sms_notifications` - SMS уведомления

## Примеры использования

### Создание пользователя

```python
from home.models import CustomUser

# Создание через create_user
user = CustomUser.objects.create_user(
    username='john_smith',
    email='john@example.co.uk',
    password='securepass123',
    first_name='John',
    last_name='Smith',
    company_name='Smith Consulting Ltd',
    company_number='87654321',
    utr='1234567890',
    country='GB',
    postal_code='SW1A 1AA',
    city='London',
    phone_number='+44123456789'
)

# UserProfile создается автоматически
print(user.profile.business_type)  # ''
```

### Обновление профиля

```python
# Обновление основной информации
user.company_name = 'Updated Company Name'
user.utr = '0987654321'
user.save()

# Обновление профиля
user.profile.business_type = 'limited_company'
user.profile.industry = 'Technology'
user.profile.company_size = '11-50'
user.profile.save()
```

### Валидация UK-полей

```python
from django.core.exceptions import ValidationError

# UTR должен быть 10 цифр
try:
    user.utr = '123456789'  # 9 цифр - ошибка
    user.full_clean()
except ValidationError as e:
    print("UTR validation error:", e)

# Company Number должен быть 8 цифр
try:
    user.company_number = '1234567'  # 7 цифр - ошибка
    user.full_clean()
except ValidationError as e:
    print("Company Number validation error:", e)
```

### Работа с формами

```python
from home.forms import CustomUserCreationForm, CustomUserProfileForm

# Форма регистрации
form = CustomUserCreationForm(data={
    'username': 'new_user',
    'email': 'new@example.co.uk',
    'password1': 'securepass123',
    'password2': 'securepass123',
    'first_name': 'Jane',
    'last_name': 'Doe',
    'company_name': 'Doe Enterprises',
    'utr': '1234567890',
    'country': 'GB'
})

if form.is_valid():
    user = form.save()
    print(f"Created user: {user.display_name}")
```

## Интеграция с Django Admin

Модели зарегистрированы в админке с удобным интерфейсом:

- `CustomUserAdmin` - управление пользователями
- `UserProfileAdmin` - управление профилями
- `UserProfileInline` - встроенное редактирование профиля

## Интеграция с Django Allauth

Модель совместима с django-allauth для социальной авторизации:

```python
# В settings.py
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]

# Настройки allauth
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = True
ACCOUNT_AUTHENTICATION_METHOD = 'username_email'
```

## API Key

Каждый пользователь автоматически получает уникальный API ключ:

```python
user = CustomUser.objects.get(username='john_smith')
print(f"API Key: {user.api_key}")
```

## Сигналы

Автоматически создается UserProfile при создании CustomUser:

```python
# При создании пользователя
user = CustomUser.objects.create_user(...)
# UserProfile создается автоматически
assert hasattr(user, 'profile')
```

## Валидаторы

### UTR (Unique Taxpayer Reference)
- Формат: 10 цифр
- Пример: `1234567890`

### Company Number
- Формат: 8 цифр  
- Пример: `12345678`

### Phone Number
- Формат: `+44123456789` или `44123456789`
- Длина: 9-15 цифр

## Миграции

Все миграции применены. Для создания новых миграций:

```bash
docker-compose exec web python manage.py makemigrations home
docker-compose exec web python manage.py migrate
```

## Тестирование

Для тестирования модели:

```python
# Создание тестового пользователя
test_user = CustomUser.objects.create_user(
    username='test_user',
    email='test@example.co.uk',
    password='testpass123',
    first_name='Test',
    last_name='User',
    company_name='Test Company',
    utr='1234567890',
    country='GB'
)

# Проверка создания профиля
assert hasattr(test_user, 'profile')
assert test_user.profile.user == test_user
``` 