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
ssh dev@192.168.0.226
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





## Today’s infrastructure and frontend changes (Task Tracker enablement)

### Docker/Compose
- Unified compose: `docker-compose.yml` now includes `frontend` service in addition to `web` (Django) and `db` (Postgres).
- Removed obsolete file: `docker-compose.frontend.yml` (no longer needed).
- Files kept:
  - `Dockerfile` — Django backend image
  - `Dockerfile.frontend` — Node 20 Alpine image for the frontend (Vite dev server)

### Frontend scaffold
- Added `frontend/` directory with minimal Vite setup and no test files:
  - `frontend/package.json` with scripts: `dev`, `build`, `preview`
  - `frontend/vite.config.js` (host 0.0.0.0, port 5173)
  - `frontend/index.html` — Calendar page
  - `frontend/matrix.html` — Eisenhower Matrix page
  - `frontend/src/main.js` — React Big Calendar (day/week/month/agenda) with DnD/time-blocking hooks
  - `frontend/src/matrix.js` — Basic Eisenhower Matrix grid with DnD (interactjs)

### Python dependencies added (requirements.txt)
- API and filters: `djangorestframework`, `django-filter`, `django-cors-headers`
- Dates/recurrence: `python-dateutil`, `pendulum`, `django-recurrence`, `icalendar`
- Realtime: `channels`, `channels-redis`
- Background jobs: `celery`, `django-celery-beat`, `django-celery-results`, `redis`
- Tags and API docs: `django-taggit`, `drf-spectacular`

### How to run (single command)
- Start all services (backend, db, frontend):
```
docker-compose up --build -d
```
- Open:
  - Backend: `http://<host-ip>:8000/` (e.g., `http://192.168.0.146:8000/`)
  - Frontend Calendar: `http://<host-ip>:5173/`
  - Eisenhower Matrix: `http://<host-ip>:5173/matrix.html`

### Useful commands
- Tail logs: `docker-compose logs -f frontend` or `docker-compose logs -f web`
- Restart a service: `docker-compose restart frontend`
- Stop all: `docker-compose down`

### Notes
- Frontend dev server listens on `0.0.0.0` and exposes ports 5173/3000/8080. Primary dev port is 5173.
- If you need to install extra JS libs inside the running container, use “Allow pasting” in terminal and then paste the needed npm command, e.g.:
  - `npm i react-big-calendar moment interactjs`
- Next steps (optional): add Redis service, wire `channels` and ASGI (Daphne) for realtime, and add Celery worker/beat for reminders.

---

## Continuation prompt (paste into assistant to resume context)

You are continuing work on the Offerland Django project running in Docker. Keep all responses in English. Repository specifics:
- Single `docker-compose.yml` orchestrates: `web` (Django 5.1), `db` (Postgres 17), `frontend` (Node 20, Vite dev server). Backend serves at `http://<host-ip>:8000`, frontend at `http://<host-ip>:5173`.
- Frontend scaffold exists under `frontend/` with React Big Calendar (day/week/month/agenda) and an Eisenhower Matrix page using interactjs. No test files should be added.
- Backend `requirements.txt` includes DRF, django-filter, django-cors-headers, python-dateutil, pendulum, django-recurrence, icalendar, channels, channels-redis, celery, django-celery-beat, django-celery-results, redis, django-taggit, drf-spectacular.
- Do not close popups when clicking outside them. Do not add any test files. If something must be tested in JS, instruct the exact command to paste after “Allow pasting”.

Goals to continue:
1) Add DRF endpoints for tasks and time blocks (create/update via drag/resize/drop), including recurrence expansion when needed.
2) Connect frontend calendar to these endpoints (load events, create on select, update on move/resize).
3) Add Eisenhower Matrix persistence (importance/urgency) and drag-to-quadrant updates.
4) Plan next: optional Channels (WebSockets) for realtime updates and Celery for reminders.

