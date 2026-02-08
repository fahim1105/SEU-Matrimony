#!/bin/bash

echo "🚀 Deploying Backend to Vercel..."
echo ""

cd Server

echo "📦 Files to deploy:"
echo "  - test.js (main backend file)"
echo "  - vercel.json (configuration)"
echo "  - package.json (dependencies)"
echo ""

echo "🔄 Starting deployment..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🧪 Testing endpoints..."
echo ""

echo "1. Testing health check:"
curl -s https://server-gold-nu.vercel.app/ | head -5
echo ""
echo ""

echo "2. Testing browse-matches:"
curl -s https://server-gold-nu.vercel.app/browse-matches/test@seu.edu.bd | head -5
echo ""
echo ""

echo "3. Testing all-biodata:"
curl -s https://server-gold-nu.vercel.app/all-biodata | head -5
echo ""
echo ""

echo "✅ If you see JSON responses above (not HTML errors), deployment was successful!"
echo "❌ If you see HTML errors, the deployment failed or is still using old code."
