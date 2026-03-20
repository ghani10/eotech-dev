# Eotech

This is an AdonisJS v7 project with Inertia.js and Vue 3.

## Prerequisites

- [Node.js](https://nodejs.org/) (version 24.0.0 or higher)
- [npm](https://www.npmjs.com/) (or your preferred package manager)
- [Docker](https://www.docker.com/)

## Getting Started (Development)

Follow these instructions to set up the project for local development.

### 1. Clone the repository

```bash
git clone <repository-url>
cd eotech
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the `.env.example` file to a new `.env` file:

```bash
cp .env.example .env
```

Open the `.env` file and set the following variables:

- `APP_KEY`: A unique key for your application. You can generate one in the next step.
- `DB_HOST`: The host of your database (e.g., `localhost`).
- `DB_PORT`: The port of your database (e.g., `3306`).
- `DB_USER`: The username for your database.
- `DB_PASSWORD`: The password for your database.
- `DB_DATABASE`: The name of your database.

### 4. Generate application key

Run the following command to generate a unique `APP_KEY` and add it to your `.env` file:

```bash
node ace generate:key
```

### 5. Run database migrations

Run the following command to create the database tables:

```bash
node ace migration:run
```

### 6. (Optional) Run database seeders

To populate the database with initial data, run:

```bash
node ace db:seed
```

### 7. Start the development server

Now you can start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3333`.

## Running Tests

To run the test suite, use the following command:

```bash
npm test
```

## Deployment (Docker)

This project can be deployed using Docker. The following instructions assume you have Docker and Docker Compose installed.

### 1. Dockerfile

A `Dockerfile` is provided to containerize the application. It's a multi-stage build that first builds the application and then creates a smaller production image.

### 2. Docker Compose

The provided `docker-compose.yaml` only includes the database service. To run the entire application stack, you can use the following `docker-compose.yaml` configuration. This configuration includes the application service, a MySQL database, and phpMyAdmin.

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3333:3333"
    environment:
      - DB_HOST=db
      - DB_PORT=3306
      - DB_USER=your-username-here
      - DB_PASSWORD=your-password-here
      - DB_DATABASE=your-database-name-here
      - APP_KEY=${APP_KEY} # Make sure to set APP_KEY in your .env file
    depends_on:
      - db

  db:
    image: mysql:latest
    environment:
      MYSQL_ROOT_USER: your-username-here
      MYSQL_ROOT_PASSWORD: your-passowrd-here   
      MYSQL_DATABASE: your-database-name-here
    ports:
      - "3308:3306"
    volumes:
      - mysql-data:/var/lib/mysql

  phpmyadmin:
    image: phpmyadmin:latest
    environment:
      PMA_HOST: your-hostname-here
      PMA_USER: your-username-here
      PMA_PASSWORD: your-password-here
    ports:
      - "8090:80"
    depends_on:
      - db

volumes:
  mysql-data:
```

### 3. Running with Docker Compose

Before running, make sure you have a `.env` file with at least an `APP_KEY` defined, as the `docker-compose.yaml` file reads it.

To build and start the containers, run:

```bash
docker-compose up -d --build
```

The application will be available at `http://localhost:3333`.

After the application starts, you may need to run database migrations inside the container:

```bash
docker-compose exec app node ace migration:run
```

To stop the containers, run:

```bash
docker-compose down
```
