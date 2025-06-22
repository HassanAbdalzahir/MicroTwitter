# 🖥️ Server Deployment Guide

Complete guide to deploy MicroTwitter on your server.

## 📋 Prerequisites

### Server Requirements

- **OS**: Ubuntu 20.04+ (recommended) or any Linux distribution
- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: At least 10GB free space
- **Network**: Public IP address or domain name
- **Ports**: 3000, 3001 (and optionally 80, 443 for Nginx)

### Local Requirements

- SSH access to your server
- Git installed locally
- Basic command line knowledge

## 🚀 Quick Deployment (Automated)

### Step 1: Prepare Your Local Machine

```bash
# Clone your project (if not already done)
git clone <your-repo-url>
cd MicroTwitter

# Make upload script executable
chmod +x upload-to-server.sh
```

### Step 2: Upload to Server

```bash
# Replace with your server details
./upload-to-server.sh YOUR_SERVER_IP YOUR_USERNAME

# Example:
./upload-to-server.sh 192.168.1.100 ubuntu
```

The script will:

- ✅ Install Docker and Docker Compose on your server
- ✅ Upload your project
- ✅ Configure environment variables
- ✅ Start the application
- ✅ Provide access URLs

## 🔧 Manual Deployment

### Step 1: Connect to Your Server

```bash
ssh username@your-server-ip
```

### Step 2: Install Docker

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for Docker group to take effect
exit
ssh username@your-server-ip
```

### Step 3: Upload Your Project

#### Option A: Using Git (Recommended)

```bash
# On your server
git clone <your-repo-url>
cd MicroTwitter
```

#### Option B: Using SCP

```bash
# On your local machine
tar --exclude='node_modules' --exclude='.next' --exclude='.git' -czf microtwitter.tar.gz .
scp microtwitter.tar.gz username@your-server-ip:~/

# On your server
tar -xzf microtwitter.tar.gz
cd MicroTwitter
```

### Step 4: Configure Environment

```bash
# Create .env file
nano .env
```

Add the following content (replace with your values):

```bash
# Backend Environment Variables
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://root:password123@mongodb:27017/microtwitter?authSource=admin
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP:3001

# MongoDB Environment Variables
MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=password123
MONGO_INITDB_DATABASE=microtwitter
```

### Step 5: Deploy Application

```bash
# Make deployment script executable
chmod +x deploy.sh

# Start the application
./deploy.sh
```

## 🌐 Domain Configuration

### Option 1: Using IP Address

Your application will be available at:

- **Frontend**: `http://YOUR_SERVER_IP:3000`
- **Backend API**: `http://YOUR_SERVER_IP:3001`

### Option 2: Using Domain Name

1. **Point your domain** to your server IP
2. **Update .env file**:
   ```bash
   NEXT_PUBLIC_API_URL=http://yourdomain.com:3001
   ```
3. **Restart services**:
   ```bash
   docker-compose restart
   ```

### Option 3: Using Nginx (Production)

1. **Use the full docker-compose.yml** (includes Nginx)
2. **Add SSL certificates** to `./ssl/` directory
3. **Update nginx.conf** for your domain
4. **Access via**: `http://yourdomain.com` (port 80)

## 🔒 Security Configuration

### 1. Change Default Passwords

```bash
# Edit .env file
nano .env

# Change these values:
MONGO_INITDB_ROOT_PASSWORD=your-strong-password
JWT_SECRET=your-very-long-random-secret-key
```

### 2. Configure Firewall

```bash
# Install UFW
sudo apt install ufw

# Allow SSH
sudo ufw allow ssh

# Allow application ports
sudo ufw allow 3000
sudo ufw allow 3001

# Enable firewall
sudo ufw enable
```

### 3. SSL/HTTPS Setup

```bash
# Install Certbot
sudo apt install certbot

# Get SSL certificate
sudo certbot certonly --standalone -d yourdomain.com

# Copy certificates to project
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./ssl/
```

## 📊 Monitoring and Management

### View Application Status

```bash
# Check if services are running
docker-compose ps

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Manage Application

```bash
# Stop application
docker-compose down

# Start application
docker-compose up -d

# Restart specific service
docker-compose restart backend

# Update application
git pull
docker-compose build --no-cache
docker-compose up -d
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

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Check what's using the port
sudo netstat -tulpn | grep :3000

# Kill process or change port in docker-compose.yml
```

#### 2. Docker Permission Issues

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Logout and login again
exit
ssh username@your-server-ip
```

#### 3. Memory Issues

```bash
# Check available memory
free -h

# Increase swap if needed
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

#### 4. Application Not Starting

```bash
# Check logs
docker-compose logs

# Check environment variables
docker-compose config

# Rebuild containers
docker-compose build --no-cache
```

### Performance Issues

```bash
# Monitor resource usage
docker stats

# Check disk space
df -h

# Check memory usage
free -h
```

## 🔄 Updates and Maintenance

### Regular Updates

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Automated Backups

Create a backup script:

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
docker exec microtwitter-mongodb mongodump --out /data/backup_$DATE
docker cp microtwitter-mongodb:/data/backup_$DATE ./backups/
```

### System Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker
sudo apt install docker-ce docker-ce-cli containerd.io
```

## 📞 Support Commands

### Quick Health Check

```bash
# Check all services
docker-compose ps

# Test frontend
curl -f http://localhost:3000

# Test backend
curl -f http://localhost:3001/api/posts

# Check database
docker exec microtwitter-mongodb mongosh --eval "db.stats()"
```

### Emergency Commands

```bash
# Stop everything
docker-compose down

# Remove all containers and volumes
docker-compose down -v --rmi all

# Restart from scratch
./deploy.sh
```

## 🎯 Production Checklist

- [ ] ✅ Docker and Docker Compose installed
- [ ] ✅ Application deployed and running
- [ ] ✅ Environment variables configured
- [ ] ✅ Default passwords changed
- [ ] ✅ Firewall configured
- [ ] ✅ Domain configured (if applicable)
- [ ] ✅ SSL certificates installed (if applicable)
- [ ] ✅ Backups configured
- [ ] ✅ Monitoring set up
- [ ] ✅ Performance optimized

## 🚀 Access Your Application

Once deployed, your MicroTwitter application will be available at:

- **Frontend**: `http://YOUR_SERVER_IP:3000`
- **Backend API**: `http://YOUR_SERVER_IP:3001`
- **With Domain**: `http://yourdomain.com` (if configured)

### Test Your Deployment

1. Open your browser and go to the frontend URL
2. Register a new account
3. Create some posts
4. Test the chat functionality
5. Verify real-time features work

Your MicroTwitter application is now live on your server! 🎉
