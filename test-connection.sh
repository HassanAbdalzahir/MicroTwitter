#!/bin/bash

# Test SSH connection to nanocode.online

echo "🔍 Testing connection to nanocode.online"
echo "========================================"

SERVER_DOMAIN="nanocode.online"
USERNAME="nanog310"
SSH_PORT="3107"

echo "Server: $SERVER_DOMAIN"
echo "Username: $USERNAME"
echo "SSH Port: $SSH_PORT"
echo ""

# Test basic connectivity
echo "🌐 Testing basic connectivity..."
if ping -c 1 $SERVER_DOMAIN > /dev/null 2>&1; then
    echo "✅ Server is reachable"
else
    echo "❌ Server is not reachable"
    exit 1
fi

# Test SSH connection
echo "🔐 Testing SSH connection..."
if ssh -p $SSH_PORT -o ConnectTimeout=10 -o BatchMode=yes $USERNAME@$SERVER_DOMAIN "echo 'SSH connection successful'" 2>/dev/null; then
    echo "✅ SSH connection successful (using SSH key)"
elif ssh -p $SSH_PORT -o ConnectTimeout=10 $USERNAME@$SERVER_DOMAIN "echo 'SSH connection successful'" 2>/dev/null; then
    echo "✅ SSH connection successful (password authentication available)"
else
    echo "❌ SSH connection failed"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   1. Check if SSH key is set up:"
    echo "      ssh-copy-id -p 3107 nanog310@nanocode.online"
    echo ""
    echo "   2. Or try manual connection:"
    echo "      ssh -p 3107 nanog310@nanocode.online"
    echo ""
    echo "   3. Check if port 3107 is correct"
    exit 1
fi

# Test if Docker is installed
echo "🐳 Checking Docker installation..."
if ssh -p $SSH_PORT $USERNAME@$SERVER_DOMAIN "command -v docker" 2>/dev/null; then
    echo "✅ Docker is installed"
else
    echo "⚠️  Docker is not installed (will be installed during deployment)"
fi

# Test if Docker Compose is installed
echo "📦 Checking Docker Compose installation..."
if ssh -p $SSH_PORT $USERNAME@$SERVER_DOMAIN "command -v docker-compose" 2>/dev/null; then
    echo "✅ Docker Compose is installed"
else
    echo "⚠️  Docker Compose is not installed (will be installed during deployment)"
fi

echo ""
echo "✅ Connection test completed successfully!"
echo "🚀 Ready to deploy MicroTwitter to nanocode.online"
echo ""
echo "Next step: ./deploy-nanocode.sh" 