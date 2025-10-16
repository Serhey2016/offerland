#!/bin/bash
# Script to fix permissions after Django operations

# Run the Django command passed as arguments
python manage.py "$@"

# Fix permissions for migrations directory
chown -R 1000:1000 /app/services_and_projects/migrations/ 2>/dev/null || true

echo "Permissions fixed for migrations directory"
