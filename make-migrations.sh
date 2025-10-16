#!/bin/bash
# Script to create migrations and fix permissions

echo "Creating migrations..."
echo "1" | docker exec -i offerland-web python manage.py makemigrations "$@"

echo "Fixing permissions..."
sudo chown -R $(id -u):$(id -g) /home/dev/offerland/services_and_projects/migrations/

echo "Done! You can now edit migration files."
