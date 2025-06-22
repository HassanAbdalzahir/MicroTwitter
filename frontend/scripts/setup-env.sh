#!/bin/bash

# MicroTwitter Frontend Environment Setup Script

echo "🚀 Setting up MicroTwitter Frontend Environment Variables"

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists. Do you want to overwrite it? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled."
        exit 1
    fi
fi

# Copy env.example to .env.local
if [ -f "env.example" ]; then
    cp env.example .env.local
    echo "✅ Created .env.local from env.example"
else
    echo "❌ env.example not found. Please create it first."
    exit 1
fi

# Ask user for custom values
echo ""
echo "🔧 Configure your environment variables:"
echo ""

# API URL
echo "Enter your backend API URL (default: http://localhost:3001):"
read -r api_url
if [ -n "$api_url" ]; then
    sed -i "s|NEXT_PUBLIC_API_URL=http://localhost:3001|NEXT_PUBLIC_API_URL=$api_url|" .env.local
fi

# Socket URL
echo "Enter your Socket.IO server URL (default: http://localhost:3001):"
read -r socket_url
if [ -n "$socket_url" ]; then
    sed -i "s|NEXT_PUBLIC_SOCKET_URL=http://localhost:3001|NEXT_PUBLIC_SOCKET_URL=$socket_url|" .env.local
fi

# App Name
echo "Enter your application name (default: MicroTwitter):"
read -r app_name
if [ -n "$app_name" ]; then
    sed -i "s|NEXT_PUBLIC_APP_NAME=MicroTwitter|NEXT_PUBLIC_APP_NAME=$app_name|" .env.local
fi

echo ""
echo "✅ Environment setup complete!"
echo "📁 Your configuration is saved in .env.local"
echo ""
echo "🚀 You can now run: npm run dev" 