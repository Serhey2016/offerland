# PrimeReact Integration Setup

## ✅ Что было добавлено

### 1. Зависимости
- **primereact**: ^10.0.0 - Основная библиотека компонентов
- **primeicons**: ^7.0.0 - Иконки для PrimeReact

### 2. Новые компоненты

#### `PrimeReactExample.tsx`
- Демонстрация основных PrimeReact компонентов
- DataTable с пагинацией и сортировкой
- Dialog с формами
- Toast уведомления
- Кнопки, поля ввода, календарь, выпадающие списки

#### `PrimeReactCalendar.tsx`
- Интеграция PrimeReact с InfiniteDailyCalendar
- Статистика событий
- Диалог добавления/редактирования событий
- Приоритеты и категории событий
- Toast уведомления

#### `PrimeReactDemo.tsx`
- Демо страница для тестирования компонентов

### 3. Обновленные файлы
- `package.json` - добавлены зависимости
- `frontend-requirements.txt` - обновлен список зависимостей
- `AgendaView.tsx` - использует новый PrimeReact календарь

## 🚀 Как запустить

### 1. Пересборка Docker контейнера
```bash
# Остановить текущие контейнеры
docker-compose down

# Пересобрать frontend контейнер с новыми зависимостями
docker-compose build frontend

# Запустить все контейнеры
docker-compose up -d
```

### 2. Альтернативный способ (если контейнер уже запущен)
```bash
# Войти в frontend контейнер
docker exec -it offerland-frontend sh

# Установить зависимости
npm install

# Перезапустить dev сервер
npm run dev -- --host 0.0.0.0
```

## 🎨 Доступные PrimeReact компоненты

### Основные компоненты
- **Button** - кнопки с иконками и стилями
- **InputText** - текстовые поля
- **Calendar** - календарь с выбором времени
- **Dropdown** - выпадающие списки
- **Dialog** - модальные окна
- **Toast** - уведомления
- **DataTable** - таблицы с пагинацией
- **Card** - карточки
- **Tag** - теги с цветовой индикацией
- **Divider** - разделители

### Темы и стили
- Используется тема `lara-light-blue`
- Подключены PrimeIcons
- Responsive дизайн
- TypeScript поддержка

## 📱 Использование в компонентах

### Базовый пример
```tsx
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'

const MyComponent = () => {
  return (
    <Button 
      label="Click me" 
      icon="pi pi-check" 
      onClick={() => console.log('Clicked!')}
    />
  )
}
```

### С TypeScript
```tsx
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'

interface User {
  id: number
  name: string
  email: string
}

const UserTable = ({ users }: { users: User[] }) => {
  return (
    <DataTable value={users} paginator rows={10}>
      <Column field="name" header="Name" sortable />
      <Column field="email" header="Email" sortable />
    </DataTable>
  )
}
```

## 🔧 Настройка

### CSS импорты (уже добавлены в компоненты)
```tsx
import 'primereact/resources/themes/lara-light-blue/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'
```

### Доступные темы
- `lara-light-blue` (по умолчанию)
- `lara-light-indigo`
- `lara-light-purple`
- `lara-dark-blue`
- `lara-dark-indigo`
- `lara-dark-purple`

## 📊 Интеграция с календарем

Новый `PrimeReactCalendar` включает:
- Статистику событий по приоритетам
- Диалог добавления/редактирования событий
- Цветовую индикацию приоритетов
- Toast уведомления
- Полную TypeScript поддержку

## 🎯 Следующие шаги

1. Пересоберите Docker контейнер
2. Откройте http://192.168.0.146:8000/task-tracker/#
3. Перейдите в Agenda view
4. Протестируйте добавление/редактирование событий
5. Изучите примеры в `PrimeReactExample.tsx`

## 📚 Документация

- [PrimeReact Official Docs](https://primereact.org/)
- [PrimeIcons](https://primereact.org/icons/)
- [Themes](https://primereact.org/theming/)
