# Система форм для OfferLand

## Обзор

Система форм была обновлена для поддержки трех различных типов публикаций:
1. **Task** (My list, Tender, Project) - сохраняется в таблицу `Task`
2. **Advertising** - сохраняется в таблицу `Advertising`
3. **TimeSlot** - сохраняется в таблицу `TimeSlot`

## Структура файлов

### Backend (Django)

#### `services_and_projects/forms.py`
Содержит функции для обработки разных типов форм:

- `create_task(request)` - создание задач (Task)
- `create_advertising(request)` - создание рекламы (Advertising)
- `create_time_slot(request)` - создание временных слотов (TimeSlot)
- `handle_form_submission(request)` - универсальная функция для определения типа и направления на соответствующую функцию

#### `services_and_projects/urls.py`
Добавлены новые URL patterns:
- `/create_task/` - для создания задач
- `/create_advertising/` - для создания рекламы
- `/create_time_slot/` - для создания временных слотов
- `/submit_form/` - универсальный endpoint (рекомендуется)

#### `services_and_projects/models.py`
Обновлены модели:
- `HashtagRelations` - исправлена структура для поддержки всех типов
- `TimeSlot` - изменена связь с сервисами на ForeignKey
- `Advertising` - добавлена связь с TypeOfTask

### Frontend (JavaScript)

#### `static/js/empty_form.js`
Основной файл для управления формами:

**Ключевые функции:**
- `handleFormSubmission(button, isPublish)` - универсальная функция отправки форм
- `updateFieldsVisibility()` - управление видимостью полей в зависимости от типа
- `handleAdvertisingFields()` - настройка полей для рекламы
- `handleTenderFields()` - настройка полей для тендера
- `handleMyListFields()` - настройка полей для "Мой список"
- `handleOrdersFields()` - настройка полей для временных слотов

**Типы публикации:**
- `advertising` - только основные поля + хэштеги
- `tender` - расширенные поля (клиент, документы, исполнители, статус)
- `my` - все поля + возможность расширения
- `orders` - только поля временного слота

#### `static/js/form_filtation.js`
Управление фильтрацией категорий и сервисов:
- `filterServicesByCategory(catId)` - фильтрация сервисов по категории
- `initCategoryServiceFiltering()` - инициализация фильтрации
- `window.initCategoryServiceSelects()` - глобальная функция для инициализации

## Логика работы

### 1. Определение типа формы
Система определяет тип формы по значению поля "Will published in":

```javascript
const TYPE_MAP = {
    '1': 'my',
    '2': 'tender', 
    '3': 'project',
    '4': 'advertising',
    '5': 'orders',
    '6': 'test_type'
};
```

### 2. Управление полями
В зависимости от типа публикации показываются/скрываются соответствующие поля:

**Advertising:**
- Скрыты: расширенные поля, исполнители, статус, документы
- Показаны: заголовок, описание, фото, хэштеги, категория, сервис

**Tender:**
- Показаны: все расширенные поля
- Скрыты: поля дат, комментарии

**My List:**
- Показаны: все поля с возможностью расширения
- Кнопка "Extend" для показа дополнительных полей

**TimeSlot:**
- Показаны: только поля временного слота
- Скрыты: все остальные поля

### 3. AJAX отправка
Форма отправляется через AJAX на endpoint `/submit_form/`:

```javascript
fetch(form.action, {
    method: 'POST',
    body: formData,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRFToken': getCookie('csrftoken')
    },
    credentials: 'same-origin'
})
```

### 4. Обработка на сервере
Backend определяет тип по `type_of_task` и направляет на соответствующую функцию:

```python
type_name = type_of_task.type_of_task_name.lower()

if 'advertising' in type_name:
    return create_advertising(request)
elif 'time slot' in type_name or 'timeslot' in type_name:
    return create_time_slot(request)
else:
    return create_task(request)
```

## Поля для разных типов

### Task (My list, Tender, Project)
- `title`, `description`, `photo_link`
- `date_start`, `date_end`, `time_start`, `time_end`
- `documents`, `status`, `is_private`, `hide_project`
- `disclose_name`, `hidden_task`, `note`
- `hashtags`, `performers`, `services`

### Advertising
- `title`, `description`, `photo_link`
- `type_of_task`, `services`
- `hashtags`

### TimeSlot
- `date_start`, `date_end`, `time_start`, `time_end`
- `reserved_time_on_road`, `start_location`
- `cost_of_1_hour_of_work`, `minimum_time_slot`
- `type_of_task`, `services`
- `hashtags` (через поле `ts-hashtags`)

## Особенности

### Хэштеги
- Для Task, Advertising и TimeSlot: поле `hashtags`
- Для TimeSlot в форме: поле `ts-hashtags` (специальное поле формы)
- Все хэштеги сохраняются через промежуточную таблицу `HashtagRelations`
- Универсальная структура: `HashtagRelations` содержит поля `task`, `advertising`, `time_slot` (одно из них заполняется)

### Исполнители
- Только для Task
- Сохраняются как JSON в поле `performers`
- Могут быть добавлены через dropdown или ввод

### Файлы
- Поддержка drag & drop
- Ссылки на Google Drive
- Прямая загрузка файлов

### Валидация
- Обязательные поля: `title`, `description`, `category`, `service`
- CSRF защита
- Обработка ошибок с пользовательскими сообщениями

## Использование

### Для разработчиков

1. **Добавление нового типа публикации:**
   - Добавить в `TYPE_MAP` в `empty_form.js`
   - Создать функцию `handleNewTypeFields()` в `empty_form.js`
   - Добавить обработку в `updateFieldsVisibility()`
   - Создать функцию `create_new_type()` в `forms.py`
   - Добавить URL pattern

2. **Изменение полей:**
   - Обновить соответствующие функции в `empty_form.js`
   - Обновить модели в `models.py`
   - Создать миграцию

### Для пользователей

1. Выбрать тип публикации в поле "Will published in"
2. Заполнить обязательные поля
3. При необходимости расширить форму (для My List)
4. Добавить хэштеги
5. Нажать "Save" или "Publish"

## Отладка

### Логирование
Все функции содержат console.log для отладки:
```javascript
console.log('Filtering for category:', catId);
console.log('initCategoryServiceFiltering called');
```

### Обработка ошибок
- AJAX запросы возвращают JSON с полем `success`
- Ошибки отображаются пользователю
- Подробные ошибки логируются в консоль

### Тестирование
Используйте `test_form_system.py` для проверки доступности данных и логики форм. 