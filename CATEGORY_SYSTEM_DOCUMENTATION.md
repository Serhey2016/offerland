# Task Category System Documentation

## Overview

Система категорий для таск-трекера позволяет перемещать задачи между различными списками с соблюдением бизнес-правил.

## Структура категорий

### Основные категории:
- **Touchpoint** - может сосуществовать с другими категориями
- **Inbox** - входящие задачи
- **Agenda** - задачи в расписании
- **Waiting** - ожидающие задачи
- **Someday** - когда-нибудь
- **Projects** - проекты (может сосуществовать с Touchpoint)
- **Lock book (Done)** - выполненные задачи
- **Archive** - архив
- **Business support** - бизнес поддержка
- **Personal support** - личная поддержка

### Подкатегории:
- **Touchpoint**: Contacts
- **Inbox**: Tasks, Projects, Favorites
- **Waiting**: In progress, Orders, Subscriptions, Published
- **Lock book (Done)**: Projects, Tasks
- **Archive**: Projects, Tasks

## Бизнес-правила

### Где задачи могут быть одновременно:
1. **Touchpoint** + одна из: Inbox, Agenda, Waiting, Someday, Projects, Lock book (Done), Archive
2. **Projects** + Touchpoint (но не с Done/Archive)

### Где задачи могут быть только в одном экземпляре:
- Inbox, Agenda, Waiting, Someday, Lock book (Done), Archive

### Специальные правила для проектов:
- Projects могут быть в Touchpoint + Projects
- Если в Done/Archive - то в Touchpoint не отображаются

## API Endpoints

### Перемещение одной задачи
```
POST /task_tracker/api/tasks/{task_id}/move/
Content-Type: application/json

{
    "category": "agenda",
    "subcategory": "optional_subcategory"
}
```

### Перемещение нескольких задач
```
POST /task_tracker/api/tasks/move-multiple/
Content-Type: application/json

{
    "task_ids": [1, 2, 3],
    "category": "archive",
    "subcategory": "tasks"
}
```

### Получение категорий задачи
```
GET /task_tracker/api/tasks/{task_id}/categories/
```

### Получение всех доступных категорий
```
GET /task_tracker/api/categories/
```

## Frontend Integration

### TaskDesign Component

Компонент `TaskDesign` теперь поддерживает:
- `taskId` prop для идентификации задачи
- Автоматическое перемещение через API
- Обработка ошибок и успешных операций

### Пример использования:

```tsx
<TaskDesign
  title="Sample Task"
  taskId={123}
  category="Inbox"
  onMenuAction={(action, subAction) => {
    if (action === 'moved') {
      console.log(`Task moved to ${subAction}`);
      // Обновить UI
    }
  }}
/>
```

## Модели Django

### TaskCategory
- `name` - уникальное имя категории
- `display_name` - отображаемое имя
- `can_coexist` - может ли сосуществовать с другими категориями
- `parent` - родительская категория (для иерархии)

### TaskSubCategory
- `name` - уникальное имя подкатегории
- `display_name` - отображаемое имя
- `parent_category` - родительская категория

### TaskCategoryRelation
- `task` - задача
- `category` - категория
- `subcategory` - подкатегория (опционально)
- `added_at` - дата добавления

## Методы Task модели

### add_to_category(category_name, subcategory_name=None)
Добавляет задачу в категорию с проверкой бизнес-правил.

### remove_from_category(category_name, subcategory_name=None)
Удаляет задачу из категории.

### get_categories()
Возвращает все категории задачи.

### can_move_to_category(target_category_name)
Проверяет, можно ли переместить задачу в целевую категорию.

## Управление

### Создание миграций
```bash
docker compose exec web python manage.py makemigrations task_tracker
```

### Применение миграций
```bash
docker compose exec web python manage.py migrate task_tracker
```

### Заполнение категорий
```bash
docker compose exec web python manage.py populate_categories
```

### Тестирование системы
```bash
docker compose exec web python /app/test_category_system.py
```

## Примеры использования

### Перемещение задачи в Agenda
```python
task = Task.objects.get(id=1)
success = task.add_to_category('agenda')
```

### Перемещение в Touchpoint с сохранением текущей категории
```python
task = Task.objects.get(id=1)
# Если задача уже в Agenda, она останется там + добавится в Touchpoint
success = task.add_to_category('touchpoint')
```

### Проверка возможности перемещения
```python
task = Task.objects.get(id=1)
can_move = task.can_move_to_category('archive')
if can_move:
    task.add_to_category('archive')
```

## Обработка ошибок

API возвращает соответствующие HTTP коды:
- `200` - успешное перемещение
- `400` - ошибка валидации (неверная категория, нарушение бизнес-правил)
- `500` - внутренняя ошибка сервера

Все ошибки содержат поле `error` с описанием проблемы.
