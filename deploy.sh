#!/bin/bash

# Production deployment script for SEU Matrimony

echo "🚀 Starting production deployment..."

# Backup current .env.local
cp .env.local .env.local.backup

# Set production API URL
sed -i '' 's|VITE_API_URL=http://localhost:5000|VITE_API_URL=https://server-gold-nu.vercel.app|g' .env.local

echo "✅ Updated API URL to production"

# Build the project
npm run build

echo "✅ Build completed"

# Restore local .env.local
mv .env.local.backup .env.local

echo "✅ Restored local environment"
echo "🎉 Production build ready in dist/ folder"
echo "📦 You can now deploy the dist/ folder to your hosting service"