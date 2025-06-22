# MicroTwitter Docker Deployment Guide

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed on your server
- At least 2GB RAM available
- Ports 80, 3000, 3001, and 27017 available

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd MicroTwitter
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Backend Environment Variables
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://root:password123@mongodb:27017/microtwitter?authSource=admin
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://your-domain.com

# MongoDB Environment Variables
MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=password123
MONGO_INITDB_DATABASE=microtwitter
```

### 3. Build and Deploy

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

### 4. Access Your Application

- **Frontend**: http://your-domain.com
- **Backend API**: http://your-domain.com/api
- **MongoDB**: localhost:27017 (for direct access)

## 🔧 Configuration Options

### Production Environment Variables

#### Backend (.env)

```bash
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://root:password123@mongodb:27017/microtwitter?authSource=admin
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

#### Frontend (.env)

```bash
NEXT_PUBLIC_API_URL=http://your-domain.com
```

### Security Considerations

1. **Change Default Passwords**:

   - Update MongoDB root password
   - Change JWT secret to a strong random string
   - Use environment variables for all secrets

2. **SSL/HTTPS Setup**:

   - Add SSL certificates to `./ssl/` directory
   - Update nginx.conf for HTTPS
   - Set up automatic SSL renewal

3. **Firewall Configuration**:
   - Only expose necessary ports (80, 443)
   - Block direct access to MongoDB port (27017)

## 📊 Monitoring and Logs

### View Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb

# Follow logs in real-time
docker-compose logs -f
```

### Health Checks

```bash
# Check service status
docker-compose ps

# Restart services
docker-compose restart backend
docker-compose restart frontend
```

## 🔄 Updates and Maintenance

### Update Application

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Backup Database

```bash
# Create backup
docker exec microtwitter-mongodb mongodump --out /data/backup

# Copy backup to host
docker cp microtwitter-mongodb:/data/backup ./backup
```

### Restore Database

```bash
# Copy backup to container
docker cp ./backup microtwitter-mongodb:/data/

# Restore
docker exec microtwitter-mongodb mongorestore /data/backup
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**:

   ```bash
   # Check what's using the port
   sudo netstat -tulpn | grep :3000

   # Kill process or change port in docker-compose.yml
   ```

2. **MongoDB Connection Issues**:

   ```bash
   # Check MongoDB logs
   docker-compose logs mongodb

   # Restart MongoDB
   docker-compose restart mongodb
   ```

3. **Build Failures**:

   ```bash
   # Clean build
   docker-compose build --no-cache

   # Check Dockerfile syntax
   docker build -t test ./backend
   ```

### Performance Optimization

1. **Resource Limits**:
   Add to docker-compose.yml:

   ```yaml
   services:
     backend:
       deploy:
         resources:
           limits:
             memory: 512M
             cpus: "0.5"
   ```

2. **Database Optimization**:
   - Add indexes to MongoDB collections
   - Monitor query performance
   - Set up database backups

## 🔒 Security Checklist

- [ ] Change default MongoDB password
- [ ] Set strong JWT secret
- [ ] Enable HTTPS with SSL certificates
- [ ] Configure firewall rules
- [ ] Set up regular backups
- [ ] Monitor logs for suspicious activity
- [ ] Keep Docker images updated
- [ ] Use non-root user in containers

## 📈 Scaling

### Horizontal Scaling

```bash
# Scale backend services
docker-compose up -d --scale backend=3

# Use load balancer for multiple instances
```

### Vertical Scaling

- Increase memory and CPU limits in docker-compose.yml
- Optimize database queries
- Add caching layer (Redis)

## 🆘 Support

For issues and questions:

1. Check logs: `docker-compose logs`
2. Verify environment variables
3. Test individual services
4. Check network connectivity
5. Review security configuration
