# Environment Configuration

This document explains how to configure the MicroTwitter frontend application using environment variables.

## Quick Setup

1. **Automatic Setup (Recommended)**

   ```bash
   npm run setup
   ```

   This will guide you through the configuration process interactively.

2. **Manual Setup**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your values
   ```

## Environment Variables

### Required Variables

| Variable                 | Description            | Default                 | Example                           |
| ------------------------ | ---------------------- | ----------------------- | --------------------------------- |
| `NEXT_PUBLIC_API_URL`    | Backend API server URL | `http://localhost:3001` | `https://api.microtwitter.com`    |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.IO server URL   | `http://localhost:3001` | `https://socket.microtwitter.com` |

### Optional Variables

| Variable                           | Description               | Default                    | Example                       |
| ---------------------------------- | ------------------------- | -------------------------- | ----------------------------- |
| `NEXT_PUBLIC_APP_NAME`             | Application name          | `MicroTwitter`             | `MyTwitter`                   |
| `NEXT_PUBLIC_APP_DESCRIPTION`      | Application description   | `A microblogging platform` | `My custom microblogging app` |
| `NEXT_PUBLIC_ENABLE_CHAT`          | Enable chat functionality | `true`                     | `false`                       |
| `NEXT_PUBLIC_ENABLE_NOTIFICATIONS` | Enable notifications      | `true`                     | `false`                       |
| `NEXT_PUBLIC_ENABLE_AVATAR_UPLOAD` | Enable avatar upload      | `true`                     | `false`                       |

### Analytics & Monitoring (Optional)

| Variable                   | Description                   | Example                     |
| -------------------------- | ----------------------------- | --------------------------- |
| `NEXT_PUBLIC_ANALYTICS_ID` | Google Analytics ID           | `G-XXXXXXXXXX`              |
| `NEXT_PUBLIC_SENTRY_DSN`   | Sentry DSN for error tracking | `https://...@sentry.io/...` |

## Environment-Specific Configuration

### Development

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NODE_ENV=development
```

### Production

```bash
# .env.production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_SOCKET_URL=https://socket.yourdomain.com
NODE_ENV=production
NEXT_PUBLIC_ANALYTICS_ID=G-XXXXXXXXXX
```

### Staging

```bash
# .env.staging
NEXT_PUBLIC_API_URL=https://api-staging.yourdomain.com
NEXT_PUBLIC_SOCKET_URL=https://socket-staging.yourdomain.com
NODE_ENV=production
```

## Using the Configuration

The application uses a centralized configuration system. Import the config in your components:

```typescript
import { config } from "../config/env";

// Use API URL
const apiUrl = config.apiUrl;

// Use Socket URL
const socketUrl = config.socketUrl;

// Check if features are enabled
if (config.enableChat) {
  // Chat functionality
}

// Check environment
if (config.isDevelopment) {
  // Development-only code
}
```

## Security Considerations

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Use `NEXT_PUBLIC_` prefix** - Only for client-side variables
3. **Server-side variables** - Use without `NEXT_PUBLIC_` prefix for server-only variables
4. **Sensitive data** - Never expose API keys or secrets to the client

## Troubleshooting

### Common Issues

1. **Environment variables not loading**

   - Restart the development server after changing `.env.local`
   - Ensure variables start with `NEXT_PUBLIC_` for client-side access

2. **API connection errors**

   - Verify `NEXT_PUBLIC_API_URL` is correct
   - Check if the backend server is running
   - Ensure CORS is properly configured on the backend

3. **Socket connection errors**
   - Verify `NEXT_PUBLIC_SOCKET_URL` is correct
   - Check if the Socket.IO server is running
   - Ensure the socket server accepts connections from your frontend domain

### Validation

You can validate your environment configuration by checking the browser console for any configuration-related errors or by using the built-in configuration validation:

```typescript
import { config } from "../config/env";

console.log("Current configuration:", config);
```

## Deployment

### Vercel

1. Go to your Vercel project settings
2. Add environment variables in the "Environment Variables" section
3. Deploy your application

### Docker

```dockerfile
# Use environment variables in Dockerfile
ENV NEXT_PUBLIC_API_URL=https://api.yourdomain.com
ENV NEXT_PUBLIC_SOCKET_URL=https://socket.yourdomain.com
```

### Other Platforms

Most deployment platforms support environment variables. Add them through their respective dashboards or configuration files.
