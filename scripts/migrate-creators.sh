#!/bin/bash

echo "Running migration to add creators as members..."
npx tsx src/scripts/migrateCreatorsToMembers.ts

echo "Migration completed!" 