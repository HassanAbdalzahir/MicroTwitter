#!/bin/bash

# MicroTwitter Server Management Script

echo "🔧 MicroTwitter Server Management"
echo "================================="

# Check if we're in the project directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Please run this script from the MicroTwitter project directory"
    exit 1
fi

# Function to show status
show_status() {
    echo "📊 Application Status:"
    docker-compose ps
    echo ""
    echo "💾 Resource Usage:"
    docker stats --no-stream
}

# Function to show logs
show_logs() {
    echo "📋 Recent Logs:"
    docker-compose logs --tail=50
}

# Function to restart services
restart_services() {
    echo "🔄 Restarting services..."
    docker-compose restart
    echo "✅ Services restarted"
}

# Function to update application
update_app() {
    echo "📦 Updating application..."
    git pull
    docker-compose build --no-cache
    docker-compose up -d
    echo "✅ Application updated"
}

# Function to backup database
backup_db() {
    echo "💾 Creating database backup..."
    DATE=$(date +%Y%m%d_%H%M%S)
    docker exec microtwitter-mongodb mongodump --out /data/backup_$DATE
    docker cp microtwitter-mongodb:/data/backup_$DATE ./backups/
    echo "✅ Backup created: backups/backup_$DATE"
}

# Function to show help
show_help() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  status    - Show application status and resource usage"
    echo "  logs      - Show recent logs"
    echo "  restart   - Restart all services"
    echo "  update    - Pull latest code and rebuild"
    echo "  backup    - Create database backup"
    echo "  stop      - Stop all services"
    echo "  start     - Start all services"
    echo "  shell     - Access MongoDB shell"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 status"
    echo "  $0 logs"
    echo "  $0 restart"
}

# Main script logic
case "$1" in
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "restart")
        restart_services
        ;;
    "update")
        update_app
        ;;
    "backup")
        backup_db
        ;;
    "stop")
        echo "🛑 Stopping services..."
        docker-compose down
        echo "✅ Services stopped"
        ;;
    "start")
        echo "🚀 Starting services..."
        docker-compose up -d
        echo "✅ Services started"
        ;;
    "shell")
        echo "🐚 Accessing MongoDB shell..."
        docker exec -it microtwitter-mongodb mongosh
        ;;
    "help"|"")
        show_help
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo "Use '$0 help' for available commands"
        exit 1
        ;;
esac 