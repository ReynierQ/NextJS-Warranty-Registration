# Next.js Warranty Registration

## Environment Setup

### Frontend `.env`
```env
# Use your network IP instead of localhost
NEXT_PUBLIC_API_URL= # Put backend API URL here
```

### Backend `.env`
```env
# Server Configuration
PORT=
HOST=
NODE_ENV=

# Frontend URL (for CORS)
FRONTEND_URL=

# PostgreSQL Database Configuration
DATABASE_URL=

# Alternative PostgreSQL configuration (if not using DATABASE_URL)
# DB_HOST=
# DB_PORT=
# DB_NAME=
# DB_USER=
# DB_PASSWORD=

# Email Configuration (Gmail example)
EMAIL_USER=
EMAIL_PASS=
ADMIN_EMAIL=

# JWT Secret
JWT_SECRET=

# File Upload Configuration
MAX_FILE_SIZE=
ALLOWED_FILE_TYPES=

# External APIs (optional)
# SENDGRID_API_KEY=
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
# AWS_BUCKET_NAME=

# For authentication
ADMIN_INITIAL_EMAIL=
ADMIN_INITIAL_PASSWORD=
```
