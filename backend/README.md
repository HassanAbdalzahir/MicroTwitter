# MicroTwitter Backend

A social media platform backend built with Node.js, TypeScript, Express, MongoDB, and Socket.IO.

## Features

- 🔐 **Authentication System** - JWT-based user registration and login
- 👥 **User Management** - User profiles, search, and online status
- 📝 **Posts System** - Create and view posts (like tweets)
- 💬 **Real-time Chat** - Socket.IO powered messaging with read receipts
- 📚 **API Documentation** - Complete Swagger/OpenAPI documentation

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.IO
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express-validator
- **Documentation**: Swagger/OpenAPI

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd MicroTwitter/backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3001`

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://admin:canyouseeme@localhost:27017/microTwitter?authSource=admin

# JWT Configuration
JWT_SECRET=canyouseeme

# CORS Configuration (Frontend URL)
FRONTEND_URL=http://localhost:3000
```

## API Documentation

### Swagger UI

Access the interactive API documentation at:

```
http://localhost:3001/api-docs
```

### API Endpoints

#### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

#### Posts

- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create a new post (requires auth)

#### Users

- `GET /api/users/search?username=<query>` - Search users by username
- `GET /api/users/:userId` - Get user profile by ID

#### Chats

- `GET /api/chats/history` - Get chat history with all users
- `GET /api/chats/:userId` - Get messages with specific user
- `POST /api/chats/:userId` - Send message to user
- `POST /api/chats/:userId/read` - Mark messages as read

## Socket.IO Events

### Client to Server

- `join` - Join user's room
- `typing:start` - Start typing indicator
- `typing:stop` - Stop typing indicator
- `chat:read` - Mark chat as read

### Server to Client

- `user:online` - User came online
- `user:offline` - User went offline
- `typing:start` - User started typing
- `typing:stop` - User stopped typing
- `chat:read` - Chat marked as read

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests (not implemented yet)

### Project Structure

```
src/
├── controllers/     # Route handlers
├── middleware/      # Custom middleware (auth, validation)
├── models/         # MongoDB schemas
├── routes/         # API route definitions
├── index.ts        # Main application file
├── socket.ts       # Socket.IO configuration
└── swagger.ts      # Swagger documentation config
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Database Models

### User

- `email` (unique) - User's email address
- `username` (unique) - User's username
- `password` (hashed) - User's password
- `avatar` - User's avatar URL
- `createdAt` - Account creation timestamp

### Post

- `name` - Author's name
- `content` - Post content
- `avatar` - Author's avatar
- `user` - Reference to User model
- `createdAt` - Post creation timestamp

### Chat

- `from` - Sender user ID
- `to` - Recipient user ID
- `content` - Message content
- `read` - Read status
- `createdAt` - Message timestamp

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.
