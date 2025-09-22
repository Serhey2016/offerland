Плагины и библиотеки что установлены для работы с requirements.txt
asgiref==3.8.1 - Асинхронная поддержка
certifi==2025.6.15 -  это Python-пакет, который предоставляет актуальный набор корневых сертификатов SSL/TLS для проверки подлинности серверов при работе с сетевыми запросами (например, через requests, urllib3 и другие библиотеки).
cffi==1.17.1  CFFI — мощный инструмент для интеграции Python и C. Он позволяет: Ускорять критические участки кода. Использовать любые C-библиотеки. Писать кроссплатформенные расширения.
charset-normalizer==3.4.2 - это библиотека, которая помогает определять и нормализовать кодировки текста (например, UTF-8, Windows-1251 и т.д.). Она часто используется в связке с библиотеками для работы с HTTP, такими как requests или urllib3.
cryptography==45.0.5 - Криптографические примитивы и инструменты для SSL/TLS, подписи, шифрования.
defusedxml==0.7.1 - Безопасный парсинг XML, защита от XXE/DoS-атак при работе с XML.
diff-match-patch==20241021 - Алгоритмы сравнения строк, вычисления diff и применения patch.
Django==5.1 - Высокоуровневый Python веб‑фреймворк для быстрого и безопасного разработки.
django-allauth==65.9.0 - Аутентификация, регистрация, социальные логины (OAuth) для Django.
django-ckeditor==6.7.0 - Интеграция визуального редактора CKEditor в Django формы/админку.
django-ckeditor-5==0.2.17 - Интеграция CKEditor 5 (современная версия редактора) с Django.
django-countries==7.6.1 - Поля и виджеты стран, выборки ISO country для моделей/форм Django.
django-environ==0.11.2 - Управление настройками через .env переменные окружения в Django.
django-import-export==2.7.0 - Импорт/экспорт данных (CSV, XLSX, JSON) из админки и команд.
django-js-asset==3.1.2 - Помощник для подключения JS-ассетов в Django виджетах/формах.
et_xmlfile==2.0.0 - Эффективная запись XML-файлов (используется, например, openpyxl).
idna==3.10 - Поддержка международных доменных имен (IDNA) для корректной работы URL.
oauthlib==3.3.1 - Библиотека протоколов OAuth1/OAuth2, базовая реализация потоков авторизации.
odfpy==1.4.1 - Чтение/запись документов формата OpenDocument (ODT, ODS и др.).
openpyxl==3.1.5 - Чтение и запись Excel файлов формата XLSX.
Pillow==11.3.0 - Работа с изображениями: ресайз, кроп, конвертация форматов и т.п.
psycopg2-binary==2.9.10 - Драйвер PostgreSQL для Python (бинарная сборка).
pycparser==2.22 - Парсер C на Python (часто используется cffi и сопутствующими пакетами).
PyJWT==2.10.1 - Создание и проверка JSON Web Tokens (JWT).
PyYAML==6.0.2 - Парсинг и генерация YAML файлов.
requests==2.32.4 - Удобный HTTP-клиент для Python.
requests-oauthlib==2.0.0 - Интеграция OAuth1/2 поверх requests для упрощения авторизации.
sqlparse==0.5.3 - Пp@$$w0rd4321арсер и форматер SQL строк (без выполнения).
tablib==3.8.0 - Наборы данных и экспорт/импорт (XLS, XLSX, JSON, YAML и др.).
urllib3==2.5.0 - Низкоуровневая HTTP-библиотека; транспорт для requests.
xlrd==2.0.2 - Чтение старых Excel файлов формата XLS (read-only).
xlwt==1.3.0 - Запись старых Excel файлов формата XLS.

# Директории проекта
### adminpanel_userside - Админ панель для администратора
- Проверка и подтверждение поданных на публикацию Проектов, Тендеров, Задач, Time Slots
- Cоздание и редактирование статей
### blog - Тут находится Front-end часть для Публикации, отображения, статей, кэйсов, компаний и других категорий что тем или инным образом связаны со статьями
### config - core блок в котором находятся основные конфигурации всего проекта
### home - Директория в которой находится Home и другие страницы front-а что работают без авторизации
### joblist - директория что вмещает в себя публикацию и работу с вакансиями
### media - директория для медиа
### notifications - приложение что отвечает за нотификацию
- попап нотификации и другое
### services_and_projects - Тут находится страницы проекта в которых логика относится к отображению Business support и Personal support шаблонов для общего просмотра
### static - css, js и другие файлы что отвечают за логику и визуальные стили
### templates - страница авторизации пользователей
### user_data - данные что сохраняются на сервере от пользователей (аватары, CV, фотографии постов)
### task_tracker - приложение для управления задачами с гибридной архитектурой
- Django backend с API endpoints для React frontend
- React компоненты для современного UI (TaskTracker, AgendaView, TouchpointView и др.)
- Hybrid Approach: простые страницы используют Django templates, сложные - React


# Разворачивание проекта.
После разворачивания проекта - для его тестовой работы нужно установить все фикстуры 
services_and_projects/fixtures

### Live ссылки
- **Навигационная панель статей**:  http://192.168.0.146:8000/adminpanel_userside/articles/
- **Создание новой статьи**: http://192.168.0.146:8000/adminpanel_userside/create_article/
[Vacancies from Boards](http://192.168.0.146:8000/adminpanel_userside/vacancies_from_boards/#)

## 🔐 Доступ и авторизация

### SSH доступ
```bash
ssh dev@192.168.0.146
```

### Учетные данные

#### Основные пользователи
- **Username**: 0432502095x@gmail.com
- **Password**: aN>074-QV91!

#### Технические пользователи
- **dev_monokai**: aN>074-QV91!
- **dev_monokai2**: aN>074-QV91!
- **dev_monokai3**: aN>074-QV91!
- **dev_monokai4**: aN>074-QV91!

#### Тестовый пользователь
- **Username**: test_uk_user
- **Email**: test@example.co.uk
- **Password**: testpass123


### Основные формы
#### Announcement (Объявления)
- **Title** - Заголовок
- **Description** - Описание
- **Photos** - Фотографии
- **Category** - Категория
- **Service** - Услуга
- **Hashtags** - Хештеги
- **Тип заказа**: Subscription, Project work, One time order

#### Job Search (Поиск работы)
- **Title** - Заголовок

#### Time Slot (Временные слоты)
- **Category** - Категория
- **Service** - Услуга
- **Date and time start** - Дата и время начала
- **Date and time end** - Дата и время окончания
- **Reserved time on road** - Зарезервированное время в пути (минуты)
- **Start location** - Место начала (почтовый индекс)
- **Cost of one hour of work** - Стоимость одного часа работы в £
- **Minimum slot** - Минимальный слот
- **Hashtags** - Хештеги

#### My List (Мой список)
- **Title** - Заголовок
- **Description** - Описание
- **Hashtags** - Хештеги

#### Project (Проект)
- **Title** - Заголовок
- **Description** - Описание
- **Photos** - Фотографии (drag & drop)
- **Category** - Категория
- **Service** - Услуга
- **Hashtags** - Хештеги
- **Documents** - Документы
- **Performer(s)** - Исполнитель(и)
- **Add status** - Добавить статус
- **Project (task) included** - Включенные проекты (задачи)

#### Tender (Тендер)
- **Title** - Заголовок
- **Description** - Описание
- **Photos** - Фотографии (ссылка)
- **Category** - Категория
- **Service** - Услуга
- **Hashtags** - Хештеги
- **Documents** - Документы
- **Performer(s)** - Исполнитель(и)
- **Add status** - Добавить статус
- **Project (task) included** - Включенные проекты (задачи)

### Форма для публикации
- **Category** - Категория
- **Service** - Услуга
- **Hashtags** - Хештеги

Типы заказов
- **Subscription** (Announcement, Timeslot, My Task)
  - Регулярные платежи за одну конкретную услугу
- **Contract** (Announcement, My Task)
  - Периодические платежи (месячно, еженедельно, ежедневно, почасовая оплата) за группу услуг
- **Project** (Tender) (Project, Tender, My Task)
  - Платеж из бюджета за группу услуг
- **One time task** (Announcement, Timeslot, My Task)
  - Один платеж за одну задачу

Способы оплаты
- **Online payment** - Онлайн оплата
- **Cash payment** - Наличная оплата
- **Crypto** - Криптовалюта
- **Free** - Бесплатно

Типы услуг
- **Offline** (start location) - Офлайн услуги
- **Online** - Онлайн услуги

Типы публикации
- **Business services** - Любые услуги онлайн или офлайн для бизнеса от самозанятых или компаний
- **Personal support** - Личная поддержка пользователей на этом сайте о работе и заработке

## 🏗️ Task Tracker - Hybrid Architecture

### Архитектурный подход
Проект использует **Hybrid Approach** для оптимального сочетания Django backend и React frontend:

#### Django Backend (task_tracker/)
- **Traditional Views**: Простые страницы используют Django templates
  - `/task_tracker/` - главная страница
  - `/task_tracker/tasks/` - список задач
  - `/task_tracker/tasks/create/` - создание задачи
  - `/task_tracker/dashboard-traditional/` - традиционный дашборд
  
- **API Endpoints**: REST API для React компонентов
  - `GET /task_tracker/api/tasks/` - получение всех задач
  - `GET /task_tracker/api/tasks/<id>/` - получение конкретной задачи
  - `POST /task_tracker/api/tasks/create/` - создание новой задачи
  - `PUT /task_tracker/api/tasks/<id>/update/` - обновление задачи
  - `DELETE /task_tracker/api/tasks/<id>/delete/` - удаление задачи
  - `GET /task_tracker/api/dashboard/stats/` - статистика дашборда

#### React Frontend (frontend/)
- **TaskTracker Component**: Основной компонент с меню и навигацией
- **View Components**: Специализированные компоненты для разных категорий
  - AgendaView, TouchpointView, InboxView, WaitingView
  - SomedayView, ProjectsView, LockbookView, ArchiveView
- **Hybrid Integration**: React монтируется в Django templates через `id="react-task-tracker"`

### Конфигурация

#### Django Settings (config/settings.py)
```python
# CORS поддержка для React frontend
INSTALLED_APPS = ['corsheaders', ...]
MIDDLEWARE = ['corsheaders.middleware.CorsMiddleware', ...]

# Статические файлы React
STATICFILES_DIRS = [
    BASE_DIR / 'static',
    BASE_DIR / 'frontend/dist',  # React build files
]

# CORS настройки
CORS_ALLOWED_ORIGINS = ["http://localhost:5173"]
CORS_ALLOW_CREDENTIALS = True
```

#### Vite Configuration (frontend/vite.config.ts)
```typescript
server: {
  proxy: {
    '/task_tracker/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    },
    '/static': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    }
  }
}
```

### Разработка и деплой

#### Development режим
1. **Django**: `python manage.py runserver` (порт 8000)
2. **Vite**: `cd frontend && npm run dev` (порт 5173)
3. **Access**: `http://localhost:8000/task_tracker/dashboard/`

#### Production режим
1. **Build React**: `cd frontend && npm run build`
2. **Django**: автоматически обслуживает статические файлы из `frontend/dist/`

### Преимущества Hybrid Approach
- **Гибкость**: Простые страницы быстро разрабатываются на Django, сложные - на React
- **Производительность**: React только там, где нужен современный UI
- **Совместимость**: Существующий Django код не требует переписывания
- **Масштабируемость**: Можно постепенно мигрировать страницы на React

## 🔧 Frontend Configuration & Dependencies

> **Note**: For debugging instructions and troubleshooting, see **FRONTEND_DEBUG_GUIDE.md**

### Package.json Dependencies
```json
{
  "dependencies": {
    "chart.js": "^4.4.0",
    "interactjs": "1.10.27",
    "moment": "^2.30.1",
    "primereact": "^10.0.0",
    "primeicons": "^7.0.0",
    "quill": "^1.3.7",
    "react": "^19.1.0",
    "react-big-calendar": "^1.19.4",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@types/react": "^19.1.13",
    "@types/react-dom": "^19.1.9",
    "@vitejs/plugin-react": "^4.7.0",
    "react-devtools": "^4.28.0",
    "typescript": "^5.9.2",
    "vite": "5.4.10"
  }
}
```

### Vite Configuration (frontend/vite.config.ts)
```typescript
export default defineConfig({
  plugins: [react({
    jsxRuntime: 'automatic',
    jsxImportSource: 'react'
  })],
  server: {
    host: '0.0.0.0',
    port: 5173,
    headers: {
      'Cross-Origin-Opener-Policy': 'unsafe-none',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    },
    proxy: {
      '/task-tracker/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/static': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  optimizeDeps: {
    include: ['primereact', 'primereact/button', 'primereact/menu'],
    exclude: ['chart.js/auto', 'quill'],
    force: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
```

### TypeScript Configuration (frontend/tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## 🐳 Docker Configuration

### Frontend Docker Setup
```dockerfile
# Dockerfile.frontend
FROM node:20-alpine
WORKDIR /app-frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ ./
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "dev"]
```

### Docker Compose Commands
```bash
# Rebuild frontend container
docker compose build frontend --no-cache

# Start frontend container
docker compose up frontend -d

# Restart frontend container
docker compose restart frontend

# View frontend logs
docker logs offerland-frontend --tail=10

# Clear Docker cache
docker system prune -f
```

## 🔧 Troubleshooting Commands

### Dependency Management
```bash
# Install new dependency
docker compose exec frontend npm install [package-name]

# Remove problematic dependency
docker compose exec frontend npm uninstall [package-name]

# Check installed packages
docker compose exec frontend npm list

# Clear npm cache
docker compose exec frontend npm cache clean --force
```

### Vite Development Server
```bash
# Check if Vite is running
curl -I http://localhost:5173/

# Check PrimeReact components
curl -I http://localhost:5173/node_modules/primereact/button/Button.js

# Check PrimeIcons CSS
curl -I http://localhost:5173/node_modules/primeicons/primeicons.css

# Check font files
curl -I http://localhost:5173/node_modules/primeicons/fonts/primeicons.woff2
```

### Browser Testing Commands
```javascript
// Check React JSX transform
console.log('React JSX transform:', typeof React === 'undefined' ? 'Modern JSX working' : 'Old transform');

// Check PrimeIcons loading
console.log('PrimeIcons loaded:', document.fonts.check('16px primeicons'));

// Check PrimeReact components
console.log('PrimeReact buttons:', document.querySelectorAll('.p-button').length);

// Check SubMenuSection
console.log('SubMenuSection:', document.getElementById('react-submenu-section'));
```

## 📋 Known Working Configurations

### Successful Vite optimizeDeps Configuration
```typescript
optimizeDeps: {
  include: ['primereact', 'primereact/button', 'primereact/menu'],
  exclude: ['chart.js/auto', 'quill'],
  force: true
}
```

### Working CORS Headers for IP Access
```typescript
headers: {
  'Cross-Origin-Opener-Policy': 'unsafe-none',
  'Cross-Origin-Embedder-Policy': 'unsafe-none',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
}
```

### Modern JSX Transform Setup
```typescript
// Vite config
plugins: [react({
  jsxRuntime: 'automatic',
  jsxImportSource: 'react'
})]

// TypeScript config
{
  "jsx": "react-jsx",
  "jsxImportSource": "react"
}
```



