#!/bin/bash

# MicroTwitter Docker Deployment Script

echo "🚀 Starting MicroTwitter Deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Backend Environment Variables
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://root:password123@mongodb:27017/microtwitter?authSource=admin
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:3001

# MongoDB Environment Variables
MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=password123
MONGO_INITDB_DATABASE=microtwitter
EOF
    echo "⚠️  Please update the .env file with your production values!"
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Remove old images (optional)
if [ "$1" = "--clean" ]; then
    echo "🧹 Cleaning old images..."
    docker-compose down --rmi all --volumes --remove-orphans
fi

# Build images
echo "🔨 Building Docker images..."
docker-compose build --no-cache

# Start services
echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service status
echo "📊 Checking service status..."
docker-compose ps

# Health check
echo "🏥 Performing health checks..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is running at http://localhost:3000"
else
    echo "❌ Frontend health check failed"
fi

if curl -f http://localhost:3001/api/posts > /dev/null 2>&1; then
    echo "✅ Backend API is running at http://localhost:3001"
else
    echo "❌ Backend API health check failed"
fi

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "📱 Access your application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:3001"
echo ""
echo "📋 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo "   Update: ./deploy.sh --clean"
echo ""
echo "⚠️  Remember to:"
echo "   1. Update the .env file with production values"
echo "   2. Set up SSL certificates for production"
echo "   3. Configure your domain in NEXT_PUBLIC_API_URL"
echo "   4. Change default passwords" 