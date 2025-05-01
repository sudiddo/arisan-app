#!/bin/bash

# Database schema sync utility script
echo "🔄 Database schema sync utility"
echo "=============================="

# Check if Prisma CLI is installed
if ! command -v npx &> /dev/null; then
  echo "❌ Error: npx is not installed. Please install Node.js and npm."
  exit 1
fi

# Pull current database schema
echo "📥 Pulling current database schema..."
npx prisma db pull

# Check for differences
if [ $? -eq 0 ]; then
  echo "✅ Database schema pulled successfully."
else
  echo "⚠️ Warning: Database schema pull failed. Your schema may be out of sync."
fi

# Generate updated client
echo "🔧 Generating updated Prisma client..."
npx prisma generate

# Apply migrations if needed
echo "📝 Checking for pending migrations..."
MIGRATION_STATUS=$(npx prisma migrate status)

if [[ $MIGRATION_STATUS == *"Database schema is up to date"* ]]; then
  echo "✅ Database schema is up to date."
else
  echo "⚠️ Database schema is not in sync with Prisma schema."
  echo "Would you like to apply migrations? (y/n)"
  read -r apply_migrations
  
  if [[ $apply_migrations == "y" ]]; then
    echo "📦 Applying migrations..."
    npx prisma migrate dev
  else
    echo "⚠️ Migrations not applied. Your database may be out of sync with your schema."
  fi
fi

echo "=============================="
echo "🎉 Database sync process completed!" 