# 🐳 MicroTwitter Docker Setup

Complete Docker containerization for the MicroTwitter application with MongoDB, Node.js backend, and Next.js frontend.

## 📁 Project Structure

```
MicroTwitter/
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── src/
├── frontend/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── src/
├── docker-compose.yml          # Development with Nginx
├── docker-compose.prod.yml     # Production without Nginx
├── nginx.conf                  # Nginx reverse proxy config
├── deploy.sh                   # Automated deployment script
├── DEPLOYMENT.md              # Detailed deployment guide
└── README-DOCKER.md           # This file
```

## 🚀 Quick Deployment

### Option 1: Simple Production Deployment

```bash
# Clone the repository
git clone <your-repo-url>
cd MicroTwitter

# Make deployment script executable
chmod +x deploy.sh

# Run automated deployment
./deploy.sh
```

### Option 2: Manual Deployment

```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d

# Or for development with Nginx
docker-compose up -d
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Backend Configuration
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://root:password123@mongodb:27017/microtwitter?authSource=admin
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://your-domain.com:3001

# MongoDB Configuration
MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=password123
MONGO_INITDB_DATABASE=microtwitter
```

### Production Settings

1. **Change Default Passwords**:

   - Update `MONGO_INITDB_ROOT_PASSWORD`
   - Set a strong `JWT_SECRET`
   - Use environment variables for all secrets

2. **Domain Configuration**:
   - Update `NEXT_PUBLIC_API_URL` with your domain
   - Configure SSL certificates if using Nginx

## 📊 Services

### MongoDB (Database)

- **Image**: mongo:7.0
- **Port**: 27017 (internal only in production)
- **Data**: Persisted in Docker volume
- **Authentication**: Root user with password

### Backend (Node.js API)

- **Port**: 3001
- **Features**: Express.js, Socket.IO, JWT auth
- **Dependencies**: MongoDB
- **Resources**: 512MB RAM, 0.5 CPU limit

### Frontend (Next.js)

- **Port**: 3000
- **Features**: React, TypeScript, Tailwind CSS
- **Dependencies**: Backend API
- **Resources**: 512MB RAM, 0.5 CPU limit

### Nginx (Optional - Reverse Proxy)

- **Ports**: 80, 443
- **Features**: Load balancing, SSL termination, rate limiting
- **Routes**: Frontend (/) and Backend (/api)

## 🛠️ Management Commands

### Basic Operations

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Restart specific service
docker-compose restart backend
```

### Development

```bash
# Start with hot reload
docker-compose up

# Rebuild after code changes
docker-compose build --no-cache
docker-compose up -d
```

### Production

```bash
# Use production compose file
docker-compose -f docker-compose.prod.yml up -d

# Scale backend services
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

## 🔍 Monitoring

### Health Checks

```bash
# Check service status
docker-compose ps

# View resource usage
docker stats

# Check logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb
```

### Database Management

```bash
# Access MongoDB shell
docker exec -it microtwitter-mongodb mongosh

# Create backup
docker exec microtwitter-mongodb mongodump --out /data/backup

# Restore backup
docker exec microtwitter-mongodb mongorestore /data/backup
```

## 🔒 Security

### Production Checklist

- [ ] Change default MongoDB password
- [ ] Set strong JWT secret
- [ ] Enable HTTPS (SSL certificates)
- [ ] Configure firewall rules
- [ ] Use non-root containers
- [ ] Regular security updates
- [ ] Monitor logs for attacks

### Network Security

```bash
# Only expose necessary ports
# Frontend: 3000
# Backend: 3001
# MongoDB: Internal only (27017)
# Nginx: 80, 443 (if used)
```

## 📈 Scaling

### Horizontal Scaling

```bash
# Scale backend services
docker-compose up -d --scale backend=3

# Use load balancer
# Configure nginx.conf for multiple backends
```

### Vertical Scaling

```yaml
# Update resource limits in docker-compose.yml
deploy:
  resources:
    limits:
      memory: 1G
      cpus: "1.0"
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Conflicts**:

   ```bash
   # Check port usage
   sudo netstat -tulpn | grep :3000

   # Change ports in docker-compose.yml
   ```

2. **Build Failures**:

   ```bash
   # Clean build
   docker-compose build --no-cache

   # Check Dockerfile syntax
   docker build -t test ./backend
   ```

3. **Database Connection**:

   ```bash
   # Check MongoDB logs
   docker-compose logs mongodb

   # Test connection
   docker exec microtwitter-backend node -e "console.log('DB connected')"
   ```

### Performance Issues

- Monitor resource usage: `docker stats`
- Check logs for errors: `docker-compose logs`
- Optimize database queries
- Add caching layer (Redis)

## 🔄 Updates

### Application Updates

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Database Updates

```bash
# Backup before updates
docker exec microtwitter-mongodb mongodump --out /data/backup

# Apply updates
docker-compose restart backend

# Verify data integrity
docker exec microtwitter-mongodb mongosh --eval "db.stats()"
```

## 📞 Support

For deployment issues:

1. Check logs: `docker-compose logs`
2. Verify environment variables
3. Test individual services
4. Review security configuration
5. Check network connectivity

## 🎯 Next Steps

1. **Production Deployment**:

   - Set up SSL certificates
   - Configure domain names
   - Set up monitoring
   - Implement backups

2. **Advanced Features**:

   - Add Redis for caching
   - Set up CI/CD pipeline
   - Implement load balancing
   - Add monitoring tools

3. **Security Hardening**:
   - Regular security audits
   - Automated backups
   - Intrusion detection
   - Performance monitoring
