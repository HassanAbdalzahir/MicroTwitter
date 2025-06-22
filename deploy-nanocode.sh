#!/bin/bash

# MicroTwitter Deployment Script for nanocode.online

echo "🚀 Deploying MicroTwitter to nanocode.online"
echo "============================================="

SERVER_DOMAIN="nanocode.online"
USERNAME="nanog310"
SSH_PORT="3107"

echo "📤 Uploading to server: $USERNAME@$SERVER_DOMAIN:$SSH_PORT"

# Test SSH connection first
echo "🔍 Testing SSH connection..."
if ! ssh -p $SSH_PORT -o ConnectTimeout=10 $USERNAME@$SERVER_DOMAIN "echo 'SSH connection successful'" 2>/dev/null; then
    echo "❌ SSH connection failed. Please check:"
    echo "   - Server is accessible"
    echo "   - SSH port 3107 is correct"
    echo "   - Username nanog310 is correct"
    echo "   - SSH key is set up (or password authentication is enabled)"
    exit 1
fi

echo "✅ SSH connection successful!"

# Create a temporary archive of the project
echo "📦 Creating project archive..."
tar --exclude='node_modules' --exclude='.next' --exclude='.git' --exclude='dist' -czf microtwitter.tar.gz .

# Upload to server
echo "📤 Uploading to server..."
scp -P $SSH_PORT microtwitter.tar.gz $USERNAME@$SERVER_DOMAIN:~/

# Create server setup script
cat > server-setup.sh << 'EOF'
#!/bin/bash

echo "🔧 Setting up MicroTwitter on nanocode.online..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "⚠️  Please logout and login again for Docker group to take effect"
    echo "   Then run: ./server-setup.sh"
    exit 0
fi

# Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Extract project
echo "📂 Extracting project..."
tar -xzf microtwitter.tar.gz
rm microtwitter.tar.gz

# Create .env file
echo "⚙️ Creating environment configuration..."
cat > .env << 'ENVEOF'
# Backend Environment Variables
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://root:password123@mongodb:27017/microtwitter?authSource=admin
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://nanocode.online:3001

# MongoDB Environment Variables
MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=password123
MONGO_INITDB_DATABASE=microtwitter
ENVEOF

echo "⚠️  IMPORTANT: Update the .env file with secure passwords!"
echo "   nano .env"

# Make deployment script executable
chmod +x deploy.sh

# Start the application
echo "🚀 Starting MicroTwitter..."
./deploy.sh

echo "✅ Setup complete!"
echo "📱 Your application should be running at:"
echo "   Frontend: http://nanocode.online:3000"
echo "   Backend API: http://nanocode.online:3001"
echo ""
echo "🔧 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop: docker-compose down"
echo "   Restart: docker-compose restart"
echo "   Manage: ./server-manage.sh status"
EOF

# Upload server setup script
scp -P $SSH_PORT server-setup.sh $USERNAME@$SERVER_DOMAIN:~/

# Execute setup on server
echo "🔧 Running setup on server..."
ssh -p $SSH_PORT $USERNAME@$SERVER_DOMAIN "chmod +x server-setup.sh && ./server-setup.sh"

# Clean up local files
rm microtwitter.tar.gz server-setup.sh

echo "✅ Upload and setup complete!"
echo ""
echo "📱 Your MicroTwitter application is now running on nanocode.online!"
echo "   Frontend: http://nanocode.online:3000"
echo "   Backend API: http://nanocode.online:3001"
echo ""
echo "🔧 To manage your application:"
echo "   ssh -p 3107 nanog310@nanocode.online"
echo "   cd MicroTwitter"
echo "   ./server-manage.sh status"
echo ""
echo "🔒 Security Reminder:"
echo "   - Change default passwords in .env file"
echo "   - Set up firewall rules"
echo "   - Consider SSL certificates for production"
EOF 