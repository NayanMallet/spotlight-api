# Spotlight API

This repository contains a RESTful API built with AdonisJS and Docker. The application uses MySQL as its database.

## ✨ Key Features

### 🔒 Security
- **Custom Exception Handling**: Specialized exception classes for consistent error responses
- **Input Sanitization**: Protection against XSS and injection attacks
- **Rate Limiting**: API abuse prevention with configurable limits
- **Comprehensive Error Logging**: Full request context tracking
- **OAuth Security**: Cryptographically secure password generation using cuid()

### ⚡ Performance
- **Database Indexes**: Composite indexes for optimized queries (type, city, date combinations)
- **Pagination Limits**: Maximum 100 items per request to prevent overload
- **N+1 Query Prevention**: Eager loading for related data
- **Optimized City Search**: Exact match + partial match for better index utilization

### 🏗️ Architecture
- **Clean Architecture**: DTOs, Base Controllers, and layered structure
- **TypeScript**: Full type safety with explicit return types
- **API Versioning**: Ready for v1, v2, v3 evolution
- **Environment Validation**: Startup validation of all required variables

### 📊 Monitoring & Logging
- **Health Check Endpoint**: `/health` for Docker and load balancer monitoring
- **Request Logging**: Automatic logging of all API requests with performance metrics
- **Error Tracking**: Comprehensive error logging with stack traces and context

## Database schema

![Untitled-4](https://github.com/user-attachments/assets/8fe78871-7e78-43cc-bbde-0753b629aa0b)

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) (if running locally)
- [PNPM](https://pnpm.io/installation) (if running locally)

## Environment Setup

The application uses environment variables defined in the `.env` file. A sample configuration is provided below:

### Required Variables

```bash
# Application
TZ=UTC
PORT=3333
HOST=0.0.0.0
LOG_LEVEL=info
APP_KEY=tiELO02WS3byq4rRiE18S9HWW3bx9J8G
NODE_ENV=development

# Database
DB_HOST=mysql_db
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_DATABASE=spotlight

# OAuth (Google)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3333/oauth/google/callback

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
MAIL_FROM=noreply@spotlight.com

# Frontend
FRONTENURL=http://localhost:5173

# Optional
APP_URL=http://localhost:3333
DRIVE_DISK=fs
```

## Docker Commands

### Development Environment

#### Starting the Application

To start the application and database services:

```bash
docker-compose up
```

To run in detached mode (background):

```bash
docker-compose up -d
```

The application includes automatic health checks. You can verify the health status:

```bash
# Check health status
curl http://localhost:3333/health

# View container health status
docker ps
```

#### Stopping the Application

To stop the running containers:

```bash
docker-compose down
```

To stop and remove volumes (this will delete all data):

```bash
docker-compose down -v
```

#### Viewing Logs

To view logs from all services:

```bash
docker-compose logs
```

To follow logs in real-time:

```bash
docker-compose logs -f
```

To view logs for a specific service:

```bash
docker-compose logs spotlight_api
docker-compose logs mysql_db
```

#### Rebuilding the Application

If you make changes to the Dockerfile or application code:

```bash
docker-compose build
# or
docker-compose up --build
```

#### Executing Commands Inside Containers

To run commands inside the application container:

```bash
docker-compose exec spotlight_api sh
```

To run database migrations:

```bash
docker-compose exec spotlight_api node ace migration:run
```

To run database seeders:

```bash
docker-compose exec spotlight_api node ace db:seed
```

### Production Environment

#### Setup Production Environment

1. Create production environment file:

```bash
cp .env.production.example .env.production
```

2. Edit `.env.production` with your production values:
   - Generate a secure `APP_KEY`: `node ace generate:key`
   - Set production database credentials
   - Configure production OAuth credentials
   - Set production SMTP settings
   - Configure production frontend URL

3. Start production services:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

4. Verify deployment:

```bash
# Check health
curl http://localhost:3333/health

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Check container status
docker ps
```

#### Production Commands

```bash
# Stop production services
docker-compose -f docker-compose.prod.yml down

# View production logs
docker-compose -f docker-compose.prod.yml logs -f spotlight_api

# Run migrations in production
docker-compose -f docker-compose.prod.yml exec spotlight_api node ace migration:run --force

# Access production container
docker-compose -f docker-compose.prod.yml exec spotlight_api sh
```

## Running Locally (Without Docker)

### Installation

```bash
pnpm install
```

### Database Setup

Make sure you have a MySQL server running and update the `.env` file with your database credentials.

### Running Migrations

```bash
node ace migration:run
```

### Starting the Development Server

```bash
node ace serve --hmr
```

### Building for Production

```bash
pnpm run build
```

### Running Tests

The project uses [Japa](https://japa.dev/) as the testing framework with AdonisJS integration.

#### 🧪 Testing Strategy (Functional & Reliable)

We use **Functional Testing** to verify the API's behavior from the perspective of an end-user. Unlike unit tests with heavy mocking, these tests hit actual endpoints and interact with a real database.

**Core Principles & Implementation:**
- **Standard API Client**: We use Japa's `client` to perform HTTP requests (`client.get()`, `client.post()`).
- **Database Transactions**: We use `testUtils.db().withGlobalTransaction()` to ensure every test runs inside a transaction that is rolled back automatically.
- **Service Fakes & Fixtures**: We use `Drive.fake()` to intercept file uploads. To bypass VineJS file extension validation errors during tests, we use our custom `createJpegFixture` helper to generate and clean up real temporary physical files instead of using raw Buffers.
- **Strict Validation & Payloads**: Tests assert actual API behavior, expecting `400 Bad Request` for validation errors (not 422), camelCase nested payloads (e.g., `artistIds`), and proper unwrapped paginated structures (`{ message, meta, data }`).

**Commands:**

```bash
# Run all functional tests
node ace test functional

# Run tests with file watching
node ace test functional --watch

# Run a specific test file
node ace test tests/functional/auth/login.spec.ts
```

#### 🚀 CI/CD Integration

To run tests in CI/CD without side effects:

1. **Set environment**: `export NODE_ENV=test`
2. **Run migrations**: `node ace migration:run`
3. **Execute tests**: `node ace test functional --reporter spec`

## 🏥 Health Check & Monitoring

### Health Check Endpoint

```bash
curl http://localhost:3333/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "database": "ok",
  "memory": {
    "used": 50,
    "total": 100,
    "unit": "MB"
  }
}
```

Use this endpoint for:
- Docker health checks
- Kubernetes liveness/readiness probes
- Load balancer health monitoring
- Uptime monitoring services

### Request Logging

All API requests are automatically logged with:
- HTTP method, URL, status code
- Response time (duration)
- IP address and user agent
- User ID (when authenticated)
- Warnings for slow requests (>1s)

Logs are output in structured JSON format for easy parsing.

## API Endpoints

### Authentication

- `POST /register`: Register a new user account
- `POST /login`: Login with email and password
- `GET /oauth/:provider`: Redirect to OAuth provider (google, facebook, github, twitter)
- `GET /oauth/:provider/callback`: Handle OAuth provider callback
- `POST /forgot-password`: Send password reset email
- `GET /reset-password/:token`: Display password reset form
- `POST /reset-password`: Reset password with token

### User Management (Authenticated)

- `PUT /users/me`: Update current user profile
- `PUT /users/:id`: Update user profile by ID
- `DELETE /users/me`: Delete current user account
- `DELETE /users/:id`: Delete user account by ID
- `POST /users/:id/banner`: Upload user banner image
- `DELETE /oauth/:provider/unlink`: Unlink OAuth provider account

### Events Management (Authenticated)

- `GET /events`: Get all events with pagination and filtering
- `POST /events`: Create a new event
- `GET /events/:id`: Get event details by ID
- `PUT /events/:id`: Update event by ID
- `PATCH /events/:id`: Partially update event by ID
- `DELETE /events/:id`: Delete event by ID

### Event-Artist Relationships (Authenticated)

- `GET /events/:id/artists`: Get artists associated with an event
- `POST /events/:id/artists`: Add artists to an event
- `DELETE /events/:id/artists`: Remove artists from an event

### Artists Management (Authenticated)

- `GET /artists`: Get all artists with pagination
- `POST /artists`: Create a new artist
- `GET /artists/:id`: Get artist details by ID
- `PUT /artists/:id`: Update artist by ID
- `PATCH /artists/:id`: Partially update artist by ID
- `DELETE /artists/:id`: Delete artist by ID

### Messages Management (Authenticated)

- `POST /messages`: Create a new message for an event
- `GET /events/:eventId/messages`: Get all messages for an event
- `GET /messages/:id`: Get message details by ID
- `PUT /messages/:id`: Update message by ID
- `PATCH /messages/:id`: Partially update message by ID
- `DELETE /messages/:id`: Delete message by ID

### Documentation

- `GET /swagger`: Get API documentation in YAML format
- `GET /docs`: View interactive Swagger UI documentation

### Testing

- `GET /scrap/events/toulouse`: Scrape events from Toulouse (testing endpoint)

## API Testing with Postman

### Postman Collection

A comprehensive Postman collection (`postman_collection.json`) is included in the repository to test all API features. The collection includes:

- **Authentication**: Registration, login, OAuth flows for multiple providers
- **User Management**: Profile updates, account deletion, banner uploads
- **Events Management**: Full CRUD operations for events
- **Artists Management**: Full CRUD operations for artists
- **Messages Management**: Full CRUD operations for messages
- **Event-Artist Relationships**: Managing artist associations with events
- **Testing Scenarios**: Complete workflows for common use cases

### Setting Up Postman Environment

1. **Import the Collection**:
   - Open Postman
   - Click "Import" and select `postman_collection.json`
   - The collection will be imported with all endpoints and test scripts

2. **Configure Environment Variables**:
   Create a new environment in Postman with the following variables:

   ```
   base_url: http://localhost:3333 (or your server URL)
   auth_token: (will be set automatically after login/register)
   user_id: (will be set automatically after login/register)
   event_id: (will be set automatically after creating an event)
   artist_id: (will be set automatically after creating an artist)
   message_id: (will be set automatically after creating a message)
   oauth_code: (for OAuth testing - get from OAuth provider)
   oauth_state: (for OAuth testing - get from OAuth provider)
   reset_token: (for password reset testing - get from email)
   ```

3. **OAuth Testing Setup**:
   For OAuth testing, you'll need to:
   - Configure OAuth providers in your `.env` file
   - Use the redirect endpoints to get authorization codes
   - Update the `oauth_code` and `oauth_state` variables manually

### Running Tests

1. **Individual Endpoints**: Run any endpoint individually by selecting it and clicking "Send"

2. **Complete Workflows**: Use the "Testing Scenarios" folder for end-to-end testing:
   - **Complete User Workflow**: Registration → Profile Update → Password Reset → Login → Account Deletion
   - **Complete Event Creation Workflow**: User Registration → Artist Creation → Event Creation → Verification

3. **Automated Testing**: The collection includes test scripts that:
   - Automatically set environment variables from responses
   - Validate response structure and data
   - Check HTTP status codes
   - Ensure proper authentication flow

### Test Data Management

- The collection uses dynamic data and environment variables
- Test users are created with unique emails using timestamps
- Created resources (events, artists, messages) are automatically linked
- Clean up is handled through the testing scenarios

## Testing Guidelines

### Manual Testing

1. **Start the Application**:

   ```bash
   docker-compose up
   ```

2. **Run Database Migrations**:

   ```bash
   docker-compose exec spotlight_api node ace migration:run
   ```

3. **Import Postman Collection** and configure environment variables

4. **Test Authentication Flow**:
   - Register a new user
   - Login with credentials
   - Test OAuth providers (if configured)
   - Test password reset functionality

5. **Test CRUD Operations**:
   - Create, read, update, and delete artists
   - Create, read, update, and delete events
   - Associate artists with events
   - Create, read, update, and delete messages

### API Documentation

Access the interactive API documentation:

- **Swagger UI**: http://localhost:3333/docs
- **OpenAPI Spec**: http://localhost:3333/swagger

## Project Structure

- `app/`: Application code
  - `controllers/`: API controllers
  - `models/`: Database models
  - `middleware/`: HTTP middleware
- `config/`: Configuration files
- `database/`: Database migrations and seeders
- `start/`: Application bootstrap files
- `tests/`: Test files

## Docker Configuration

The application uses a multi-stage Docker build process:

- Base stage: Sets up the Node.js environment
- Dependencies stage: Installs all dependencies
- Build stage: Builds the application
- Production stage: Creates a minimal production image

The docker-compose.yml file defines two services:

- `mysql_db`: MySQL database
- `spotlight_api`: AdonisJS application

## License

UNLICENSED
