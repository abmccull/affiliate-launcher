#!/bin/bash

# Deploy Prisma migrations to production
# Run this after deploying to Vercel

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Migrations complete!"

