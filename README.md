# Spotlight API

This repository contains a RESTful API built with AdonisJS and Docker. The application uses MySQL as its database.

## Database schema
![Untitled-3](https://github.com/user-attachments/assets/6c1453b4-1d6a-4bce-9ce8-8cd0c31989f7)

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) (if running locally)
- [PNPM](https://pnpm.io/installation) (if running locally)

## Environment Setup

The application uses environment variables defined in the `.env` file. A sample configuration is provided below:

```
TZ=UTC
PORT=3333
HOST=0.0.0.0
LOG_LEVEL=info
APP_KEY=tiELO02WS3byq4rRiE18S9HWW3bx9J8G
NODE_ENV=development
DB_HOST=mysql_db
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_DATABASE=spotlight
```

## Docker Commands

### Starting the Application

To start the application and database services:

```bash
docker-compose up
```

To run in detached mode (background):

```bash
docker-compose up -d
```

### Stopping the Application

To stop the running containers:

```bash
docker-compose down
```

To stop and remove volumes (this will delete all data):

```bash
docker-compose down -v
```

### Viewing Logs

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

### Rebuilding the Application

If you make changes to the Dockerfile or application code:

```bash
docker-compose build
# or
docker-compose up --build
```

### Executing Commands Inside Containers

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

```bash
pnpm test
```

## API Endpoints

- `GET /`: Hello world endpoint
- `POST /register`: Register a new user
- `POST /login`: Login endpoint

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
