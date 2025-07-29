#!/bin/bash

echo "Importing fixtures..."

# Import hashtags first (they are referenced by services)
echo "1. Importing hashtags..."
docker-compose exec web python manage.py loaddata services_and_projects/fixtures/hashtags.json

# Import users
echo "2. Importing users..."
docker-compose exec web python manage.py loaddata services_and_projects/fixtures/users_allauth.json

# Import services and categories
echo "3. Importing services and categories..."
docker-compose exec web python manage.py loaddata services_and_projects/fixtures/services_and_categories.json

echo "All fixtures imported successfully!"
echo "Summary:"
docker-compose exec web python manage.py shell -c "
from home.models import CustomUser
from services_and_projects.models import ServicesCategory, Services
from joblist.models import AllTags
print(f'Users: {CustomUser.objects.count()}')
print(f'Categories: {ServicesCategory.objects.count()}')
print(f'Services: {Services.objects.count()}')
print(f'Hashtags: {AllTags.objects.count()}')
" 