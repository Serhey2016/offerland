# Система форм для OfferLand

## Обзор

Система форм была полностью переработана для поддержки отдельных HTML-форм для каждого типа публикации:
1. **Advertising** - сохраняется в таблицу `Advertising`
2. **Job Search** - сохраняется в таблицу `JobSearch`
3. **Time Slot** - сохраняется в таблицу `TimeSlot`
4. **My List** - сохраняется в таблицу `Task`
5. **Tender** - сохраняется в таблицу `Task`
6. **Project** - сохраняется в таблицу `Task`

## Структура файлов

### Backend (Django)

#### `services_and_projects/forms.py`
Содержит функции для обработки разных типов форм:

- `create_advertising(request)` - создание рекламы (Advertising)
- `handle_form_submission(request)` - универсальная функция для определения типа и направления на соответствующую функцию

#### `services_and_projects/urls.py`
Основной endpoint:
- `/submit_form/` - универсальный endpoint для всех типов форм

#### `services_and_projects/models.py`
Модели для хранения данных:
- `Advertising` - рекламные объявления
- `JobSearch` - поиск работы
- `TimeSlot` - временные слоты
- `Task` - задачи (My List, Tender, Project)
- `AdvertisingHashtagRelations` - связи хэштегов с рекламой

### Frontend (JavaScript)

#### `static/js/form_for_all_task.js`
Основной файл для управления формами:

**Ключевые функции:**
- `handleFormSave(form, saveButton)` - универсальная функция отправки форм
- `initHashtags()` - инициализация системы хэштегов
- `addHashtag(tagName, container, hidden, tagId)` - добавление хэштега
- `removeHashtag(chip, hidden)` - удаление хэштега
- `updateHashtagsHidden(hidden)` - обновление скрытого поля хэштегов
- `populateDropdown(filter, dropdown, allTags)` - заполнение выпадающего списка хэштегов

**Типы публикации:**
- `advertising` - форма с заголовком, описанием, фото, хэштегами, категорией, сервисом
- `job-search` - форма с заголовком
- `time-slot` - форма с временными параметрами, категорией, сервисом, хэштегами
- `my-list` - форма с заголовком и описанием
- `tender` - форма с заголовком, описанием, фото, документами, исполнителями, статусом
- `project` - форма с заголовком, описанием, фото, документами, исполнителями, статусом

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
│   │   ├── form_for_all_task.js
│   │   ├── advertising_feed.js
│   │   ├── tasks_projects_tenders.js
│   │   ├── social_feed_hide_icon.js
│   │   └── popup.js
│   └── css/
│       ├── servoces_and_projects.css
│       └── lib_alertify/
└── ...
```

---

## Логика работы

### 1. Выбор типа формы
Пользователь нажимает на кнопку "fixed_circle sub sub2", открывается модальное окно выбора типа публикации с текстом "Select Publication Type". После выбора типа открывается соответствующая форма.

### 2. Управление формами
Каждая форма имеет уникальный ID и отображается независимо:

**Advertising:**
- ID: `advertising-form`
- Поля: заголовок, описание, фото, хэштеги, категория, сервис

**Job Search:**
- ID: `job-search-form`
- Поля: заголовок

**Time Slot:**
- ID: `time-slot-form`
- Поля: дата и время начала/окончания, зарезервированное время, место начала, стоимость часа, минимальный слот, хэштеги, категория, сервис

**My List:**
- ID: `my-list-form`
- Поля: заголовок, описание

**Tender:**
- ID: `tender-form`
- Поля: заголовок, описание, фото (ссылка), категория, сервис, хэштеги, документы, исполнители, статус, включенный проект

**Project:**
- ID: `project-form`
- Поля: заголовок, описание, фото (загрузка), категория, сервис, хэштеги, документы, исполнители, статус, включенный проект

### 3. AJAX отправка
Форма отправляется через AJAX на endpoint `/submit_form/`:

```javascript
fetch(form.action, {
    method: 'POST',
    body: formData,
    headers: {
        'X-Requested-With': 'XMLHttpRequest'
    }
})
```

### 4. Обработка на сервере
Backend определяет тип по `type_of_task` и направляет на соответствующую функцию:

```python
type_of_task_id = request.POST.get('type_of_task')
if type_of_task_id == '4':  # Advertising
    return create_advertising(request)
# Другие типы обрабатываются аналогично
```

## Поля для разных типов

### Advertising
- `title`, `description`, `photos` (drag & drop)
- `type_of_task` (скрытое поле = 4), `services`
- `hashtags` (через систему хэштегов)

### Job Search
- `title`
- `type_of_task` (скрытое поле = 6)

### Time Slot
- `date_start`, `date_end`, `time_start`, `time_end`
- `reserved_time_on_road`, `start_location`
- `cost_of_1_hour_of_work`, `minimum_time_slot`
- `type_of_task` (скрытое поле = 5), `services`
- `hashtags` (через систему хэштегов)

### My List (Task)
- `title`, `description`
- `type_of_task` (скрытое поле = 1)

### Tender
- `title`, `description`, `photos` (ссылка)
- `type_of_task` (скрытое поле = 2), `services`
- `hashtags`, `documents`, `performers`, `status`, `project_included`

### Project
- `title`, `description`, `photos` (drag & drop)
- `type_of_task` (скрытое поле = 3), `services`
- `hashtags`, `documents`, `performers`, `status`, `project_included`

## Система хэштегов

### Структура
- Каждая форма имеет контейнер хэштегов с классом `.hashtag-chip-container`
- Поле ввода с классом `.hashtags-input-field`
- Выпадающий список с классом `.hashtag-dropdown-menu`
- Скрытое поле `input[name="hashtags"]` для передачи данных на сервер

### Функциональность
- Автодополнение при вводе
- Фильтрация уже выбранных хэштегов из выпадающего списка
- Добавление/удаление хэштегов через чипы
- Автоматическое обновление скрытого поля
- Поддержка drag & drop для файлов

## Уведомления

### Alertify.js
Система использует библиотеку Alertify.js для отображения уведомлений:
- Успешное сохранение: зеленое уведомление в правом верхнем углу
- Ошибки: красное уведомление с текстом ошибки
- Автоматическое закрытие модального окна через 2 секунды после успешного сохранения

### Интеграция
Файлы Alertify.js находятся в `static/js/lib_alertify/`:
- `alertify.min.js` - основная библиотека
- `alertify_integra.js` - настройки для проекта

## Валидация обязательных полей

### Обязательные поля для разных типов публикаций

- **Advertising:**
  - Обязательные: `Title`, `Description`
  - Необязательные: `Service`, `Photos`, `Hashtags`
- **Job Search:**
  - Обязательные: `Title`
- **Time Slot:**
  - Обязательные: `Date start`, `Date end`, `Time start`, `Time end`
  - Необязательные: `Service`, `Hashtags`
- **My List:**
  - Обязательные: `Title`, `Description`
- **Tender:**
  - Обязательные: `Title`, `Description`
  - Необязательные: `Service`, `Photos`, `Hashtags`, `Documents`, `Performers`, `Status`
- **Project:**
  - Обязательные: `Title`, `Description`
  - Необязательные: `Service`, `Photos`, `Hashtags`, `Documents`, `Performers`, `Status`

> **Service (услуга) не является обязательным полем ни для одного типа формы.**

## Использование

### Для разработчиков

1. **Добавление нового типа публикации:**
   - Создать HTML форму в `form_for_all_task.html` с уникальным ID
   - Добавить обработку в `handleFormSave()` в `form_for_all_task.js`
   - Создать функцию создания в `forms.py`
   - Добавить тип в `getFormType()` в JavaScript

2. **Изменение полей:**
   - Обновить HTML форму
   - Обновить соответствующие функции в JavaScript
   - Обновить модели в `models.py`
   - Создать миграцию

### Для пользователей

1. Нажать на кнопку "fixed_circle sub sub2"
2. Выбрать тип публикации в модальном окне
3. Заполнить обязательные поля
4. Добавить хэштеги (при необходимости)
5. Нажать "Save"

## Отладка

### Логирование
Все функции содержат подробное логирование для отладки:
```javascript
console.log('=== FORM SAVE START ===');
console.log('Form ID:', form.id);
console.log('Form type:', formType);
```

### Обработка ошибок
- AJAX запросы возвращают JSON с полем `success`
- Ошибки отображаются пользователю через Alertify
- Подробные ошибки логируются в консоль браузера

## Исправленные ошибки

### Ошибка "Form ID пустой"
**Проблема:** JavaScript не мог найти формы из-за отсутствия ID.

**Решение:** Добавлены уникальные ID ко всем формам:
- `advertising-form`
- `job-search-form`
- `time-slot-form`
- `my-list-form`
- `tender-form`
- `project-form`

### Ошибка "Hidden field not found"
**Проблема:** JavaScript не мог найти скрытые поля хэштегов.

**Решение:** Изменена логика поиска скрытых полей с `form.id` на `form.querySelector('input[name="hashtags"]')`.

### Ошибка "Hashtags not disappearing from dropdown"
**Проблема:** Выбранные хэштеги не исчезали из выпадающего списка.

**Решение:** Добавлена фильтрация уже выбранных хэштегов в функции `populateDropdown()`.

## Связь с пользователем (owner relations)

### Архитектура owner relations
- Для Task: используется промежуточная таблица `TaskOwnerRelations` (task, user)
- Для Advertising: используется промежуточная таблица `AdvertisingOwnerRelations` (advertising, user)
- Для TimeSlot: используется промежуточная таблица `TimeSlotOwnerRelations` (time_slot, user)

### Логика сохранения
После создания основной сущности на сервере, если пользователь авторизован (`request.user.is_authenticated`), создаётся запись в соответствующей owner relations таблице, связывающая объект с пользователем.

## Каскадное удаление фотографий

При удалении Task, Advertising или TimeSlot автоматически удаляются все связанные с ними фотографии (PhotoRelations) через переопределение метода `delete()` в соответствующих моделях.

## Структура HTML форм

Каждая форма имеет следующую структуру:
```html
<div id="[type]-form" class="modal-overlay">
    <div class="modal-form">
        <form class="project-form" id="[type]-form" method="post" enctype="multipart/form-data">
            <!-- Поля формы -->
            <input type="hidden" name="type_of_task" value="[id]">
            <input type="hidden" name="hashtags" id="[type]-hashtags-hidden">
            <!-- Кнопки -->
            <button type="button" class="save-btn btn btn-secondary">Save</button>
        </form>
    </div>
</div>
```

## Особенности реализации

### Drag & Drop
Поддержка drag & drop для загрузки файлов в формах Advertising и Project.

### CSRF защита
Все формы защищены CSRF токенами Django.

### Адаптивность
Формы адаптированы для мобильных устройств и различных размеров экрана.

### Производительность
Оптимизированная инициализация и обработка событий для быстрой работы. 