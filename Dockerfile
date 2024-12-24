# Используем образ Python 3.13
FROM python:3.13.1-slim

# Устанавливаем зависимости системы
RUN apt-get update && apt-get install -y \
    libpq-dev gcc postgresql-client && \
    rm -rf /var/lib/apt/lists/*

# Указываем рабочую директорию
WORKDIR /app

# Копируем файл зависимостей и устанавливаем их
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем исходный код проекта
COPY . .

# Копируем wait-for-db.sh скрипт
COPY wait-for-db.sh /app/wait-for-db.sh

# Делаем wait-for-db.sh скрипт исполняемым
RUN chmod +x /app/wait-for-db.sh

# Указываем команду по умолчанию
CMD ["sh", "-c", "/app/wait-for-db.sh db python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]