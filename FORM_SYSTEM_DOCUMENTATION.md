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

## Структура статических файлов

Все статические файлы JavaScript и CSS должны храниться только в следующих директориях проекта:

- `static/js/` — все пользовательские и сторонние JS-файлы
- `static/css/` — все пользовательские и сторонние CSS-файлы

**Важно:** Наличие файлов JS или CSS в других директориях (например, `services_and_projects/static/js/` или `app/static/js/`) считается ошибкой структуры и должно быть устранено. Все такие файлы должны быть перемещены в соответствующие папки внутри `static/`.

**Пример правильной структуры:**

```
project_root/
├── static/
│   ├── js/
│   │   ├── empty_form.js
│   │   ├── form_filtation.js
│   │   └── ...
│   └── css/
│       ├── main.css
│       └── ...
└── ...
```

---

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
- `hashtags` (через поле `ts-hashtags` - вводится вручную, разделяется запятыми)

## ID блоков для каждого типа задач

### 1. Advertising
```
- form-group-type_of_task (Will published in)
- form-group-category
- form-group-service  
- form-group-title
- form-group-description
- form-group-photos-link
- form-group-photos-link_drop_file
- form-group-hashtags-input
- form-group-documents
- form-group-performers
- form-group-date-time
- form-group-disclose-name-1
- form-group-hidden
- form-group-post-code
- form-group-disclose-name
- form-group-street_details
- form-actions (кнопки)
```

### 2. Tender
```
- form-group-type_of_task (Will published in)
- form-group-category
- form-group-service
- form-group-hashtags-input
- form-group-documents
- form-group-performers
- form-group-status
- form-group-project-included
- form-group-photos-link
- form-actions (кнопки)
```

### 3. Project
```
- form-group-type_of_task (Will published in)
- form-group-category
- form-group-service
- form-group-hashtags-input
- form-group-documents
- form-group-performers
- form-group-status
- form-group-project-included
- form-group-photos-link
- form-actions (кнопки)
```

### 4. My list (Task)
```
- form-group-type_of_task (Will published in)
- form-group-title
- form-group-description
- form-actions (кнопки)
```

### 5. Time slot
```
- form-group-type_of_task (Will published in)
- time-date-input
- form-group-reserved-time
- form-group-start-location
- form-group-cost-hour
- form-group-min-slot
- form-group-hashtags-input
- form-group-category
- form-group-service
- form-actions (кнопки)
```

### 6. Job search
```
- form-group-type_of_task (Will published in)
- form-group-title
- form-actions (кнопки)
```

**Примечания:**
- `form-group-type_of_task` (поле "Will published in") должно быть видимым для всех типов
- `form-actions` (кнопки действий) должно быть видимым для всех типов
- Все остальные поля скрываются для типов, где они не нужны
- Поля `form-group-photos-link_or` и `hashtags-hidden` скрываются для всех типов, так как это служебные элементы

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

## Валидация обязательных полей

### Обязательные поля для разных типов публикаций

- **Task (My list, Tender, Project):**
  - Обязательные: `Title`, `Description`, `Category`
  - Необязательные: `Service`, `Photos`, `Hashtags`, и др.
- **Advertising:**
  - Обязательные: `Title`, `Description`
  - Необязательные: `Service`, `Photos`, `Hashtags`, и др.
- **TimeSlot:**
  - Обязательные: `Date start`, `Date end`, `Time start`, `Time end`
  - Необязательные: `Service`, `Photos`, `Hashtags`, и др.

> **Service (услуга) не является обязательным полем ни для одного типа формы.**

Если не заполнены обязательные поля, сервер возвращает информативное сообщение на английском, например:
- `Please fill in all required fields: Title, Description, and Category.`
- `Please fill in all required fields: Title and Description.`
- `Please fill in all required fields: Date start, Date end, Time start, and Time end.`

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

## Исправленные ошибки

### Ошибка "Field 'id' expected a number but got '3,5,1'"
**Проблема:** Хэштеги передавались как строка с ID, разделенными запятыми, но Django ожидал отдельные поля для ManyToMany.

**Решение:** 
- Для Task и Advertising: изменен код для парсинга строки с ID хэштегов
- Для TimeSlot: изменен код для поиска хэштегов по названию (создание новых при необходимости)

**Код исправления:**
```python
# Вместо request.POST.getlist('hashtags')
hashtags_data = request.POST.get('hashtags')
if hashtags_data:
    hashtag_ids = [id.strip() for id in hashtags_data.split(',') if id.strip()]
    for tag_id in hashtag_ids:
        tag_obj = AllTags.objects.get(id=tag_id)
        # Создание связи...
```

### Удаление неиспользуемого поля ts-services
**Проблема:** Поле `ts-services` в форме TimeSlot не использовалось в коде.

**Решение:** Удалено из кода, так как в модели TimeSlot уже есть поле `services` как ForeignKey. 

## Связь с пользователем (owner relations) и сохранение через AJAX

### Архитектура owner relations
- Для Task: используется промежуточная таблица `TaskOwnerRelations` (task, user)
- Для Advertising: используется промежуточная таблица `AdvertisingOwnerRelations` (advertising, user)
- Для TimeSlot: используется промежуточная таблица `TimeSlotOwnerRelations` (time_slot, user)

### Логика сохранения
- После создания основной сущности (Task, Advertising, TimeSlot) на сервере, если пользователь авторизован (`request.user.is_authenticated`), создаётся запись в соответствующей owner relations таблице, связывающая объект с пользователем.
- Это реализовано в функциях `create_task`, `create_advertising`, `create_time_slot` в `services_and_projects/forms.py`:

```python
if request.user.is_authenticated:
    TaskOwnerRelations.objects.get_or_create(task=task, user=request.user)
# Аналогично для Advertising и TimeSlot
```

### AJAX и фронтенд
- Форма отправляется через AJAX (см. `handleFormSubmission` в `static/js/empty_form.js`).
- Все данные (включая performers, hashtags, comments, photos, services) отправляются одной формой.
- Сервер обрабатывает данные, создаёт основную сущность, связанные объекты и owner relation.
- Пользователь, создавший Task, Advertising или TimeSlot, автоматически становится владельцем через owner relations.

### Проверка
- Если пользователь авторизован и отправляет форму через AJAX, то Task, Advertising, TimeSlot будут связаны с ним через owner relations.
- Все связи (hashtags, performers и т.д.) сохраняются через промежуточные таблицы.

--- 

## Каскадное удаление фотографий

### Поведение

При удалении Task, Advertising или TimeSlot теперь автоматически удаляются все связанные с ними фотографии (PhotoRelations), если они были прикреплены к этим объектам. Это реализовано через переопределение метода `delete()` в соответствующих моделях.

- Для каждой Task, Advertising и TimeSlot фотографии уникальны и не используются перекрёстно между объектами.
- При удалении Task, Advertising или TimeSlot связанные фотографии удаляются из базы данных и файловой системы.

### Техническая реализация

В файле `services_and_projects/models.py` для моделей Task, Advertising и TimeSlot реализовано:

```python
class Task(models.Model):
    # ...
    def delete(self, *args, **kwargs):
        related_photos = list(self.photos.all())
        super().delete(*args, **kwargs)
        for photo in related_photos:
            photo.delete()

class Advertising(models.Model):
    # ...
    def delete(self, *args, **kwargs):
        related_photos = list(self.photos.all())
        super().delete(*args, **kwargs)
        for photo in related_photos:
            photo.delete()

class TimeSlot(models.Model):
    # ...
    def delete(self, *args, **kwargs):
        related_photos = list(self.photos.all())
        super().delete(*args, **kwargs)
        for photo in related_photos:
            photo.delete()
```

**Важно:**
- Это поведение безопасно, если фотографии действительно уникальны для каждого объекта.
- Если потребуется изменить логику (например, если фото будут использоваться в нескольких объектах), потребуется дополнительная проверка связей перед удалением. 

## Кастомизация уведомлений через SweetAlert2

### Где находится логика уведомлений

Весь JavaScript-код, связанный с отображением уведомлений о результате отправки форм (успех/ошибка) через SweetAlert2, вынесен в отдельный файл:

- `static/js/sweetalert2_modif.js`

### Сценарий работы

- При нажатии на кнопку "Save" в форме (например, с классом `.project-form`) данные отправляются через AJAX (fetch).
- После получения ответа от сервера popup (модальное окно) закрывается.
- В зависимости от результата отображается уведомление через SweetAlert2:
    - Если успешно: появляется окно с иконкой успеха и сообщением "Данные успешно сохранены".
    - Если ошибка: появляется окно с иконкой ошибки и текстом ошибки.

### Пример кода (см. файл)

```js
// static/js/sweetalert2_modif.js
saveBtn.addEventListener('click', function(e) {
    e.preventDefault();
    // ...
    fetch(form.action, { ... })
        .then(response => response.json())
        .then(data => {
            if (modalOverlay) modalOverlay.style.display = 'none';
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Сохранено!',
                    text: 'Данные успешно сохранены.',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Ошибка!',
                    text: data.error || 'Не удалось сохранить данные.'
                });
            }
        })
        .catch(error => {
            if (modalOverlay) modalOverlay.style.display = 'none';
            Swal.fire({
                icon: 'error',
                title: 'Ошибка!',
                text: 'Произошла ошибка при отправке формы.'
            });
        });
});
```

### Особенности
- Вся логика уведомлений централизована в одном файле для удобства поддержки.
- Для изменения поведения уведомлений (например, текста, иконок, тайминга) редактируйте только `static/js/sweetalert2_modif.js`.
- Для корректной работы SweetAlert2 должны быть подключены файлы `sweetalert2.all.min.js` и `sweetalert2.min.css` в шаблоне. 