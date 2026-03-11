
# Project Setup Guide

## Prerequisites

- Docker and Docker Compose installed
- Git installed

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd eotech
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Update `.env` with your local values:

```env
# Database
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=1122
DB_DATABASE=eotech

# App
APP_KEY=your-app-key-here
```

### 3. Start Services with Docker Compose

```bash
docker-compose up -d
```

### 4. Initialize Database

```bash
docker-compose exec api python manage.py migrate
```

### 5. Verify Setup

```bash
docker-compose ps
```

## Available Services

- **AdonisJS API**: http://localhost:3333
- **MySQL Database**: localhost:3307
- **phpMyAdmin**: http://localhost:8090

## Common Commands

```bash
# View logs
docker-compose logs -f api

# Stop services
docker-compose down

# Rebuild containers
docker-compose up -d --build
```

## Collaboration Notes

Always commit `.env.example` with required keys but no values. Never commit `.env`.
