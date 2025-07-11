# Исправление хэштегов - Резюме

## Проблема
В модели `Advertising` поле `hashtags` не использовало промежуточную таблицу `HashtagRelations`, в отличие от моделей `Task` и `TimeSlot`.

## Решение

### 1. Изменение модели Advertising
- Изменено поле `hashtags` с обычного M2M на M2M с `through='HashtagRelations'`
- Теперь все три модели (`Task`, `Advertising`, `TimeSlot`) используют единую структуру хэштегов

### 2. Миграции
- Создана миграция `0014_remove_advertising_hashtags` для удаления старого поля
- Создана миграция `0015_advertising_hashtags` для добавления нового поля с `through`

### 3. Универсальная структура HashtagRelations
```python
class HashtagRelations(models.Model):
    id = models.AutoField(primary_key=True)
    task = models.ForeignKey('Task', on_delete=models.CASCADE, null=True, blank=True)
    advertising = models.ForeignKey('Advertising', on_delete=models.CASCADE, null=True, blank=True)
    time_slot = models.ForeignKey('TimeSlot', on_delete=models.CASCADE, null=True, blank=True)
    hashtag = models.ForeignKey('joblist.AllTags', on_delete=models.CASCADE)
```

## Результат
✅ Все модели используют единую структуру хэштегов  
✅ Консистентность данных между Task, Advertising и TimeSlot  
✅ Упрощенная логика работы с хэштегами в коде  
✅ Все миграции применены успешно  

## Текущее состояние моделей

### Task
```python
hashtags = models.ManyToManyField('joblist.AllTags', through='HashtagRelations', blank=True)
```

### Advertising
```python
hashtags = models.ManyToManyField('joblist.AllTags', through='HashtagRelations', blank=True)
```

### TimeSlot
```python
hashtags = models.ManyToManyField('joblist.AllTags', through='HashtagRelations', blank=True)
```

## Использование в коде
Все три модели теперь используют одинаковый подход для работы с хэштегами:

```python
# Создание связи
HashtagRelations.objects.create(task=task, hashtag=tag_obj)
HashtagRelations.objects.create(advertising=advertising, hashtag=tag_obj)
HashtagRelations.objects.create(time_slot=time_slot, hashtag=tag_obj)

# Получение хэштегов
task.hashtags.all()
advertising.hashtags.all()
time_slot.hashtags.all()
``` 