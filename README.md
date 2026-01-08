# Project URLs
- Frontend (Website): localhost:3000
- Backend API: localhost:8080

# Account Information
- Admin Account: 
  - email: admin1@blueangelscare.com
  - password: password123
- Manager Account:
  - email: manager1@blueangelscare.com
  - password: password123
- DSP Account:
  - email: dsp1@blueangelscare.com
  - password: password123

# Project Setup Guide

## Prerequisites
- Docker & Docker Compose
- Node.js (v18 or higher)
- Java 17 or higher
- Maven

## Database Setup

- Ensure .env is existed and run command: 'docker-compose up -d'

## Backend Setup

1. Run backend:

'mvn clean install'
'mvn spring-boot:run'

Or use IntelliJ: Open project and click Run button.

## Frontend Setup (Next.js)

1. Navigate to frontend directory
2. Install dependencies: 'npm install'
3. Run development server: 'npm run dev'

## Mobile Setup (React Native)

1. Navigate to mobile directory
2. Install dependencies: 'npm install'
3. Run on Android: 'npm run android'
   or iOS (macOS only): 'npm run ios'

# Startup Sequence

1. Start Docker: `docker-compose up -d`
2. Start backend: `mvn spring-boot:run` (in backend directory)
3. Start frontend: `npm run dev` (in frontend directory)
4. Start mobile: `npm run android` or `npm run ios` (in mobile directory)

# Technology Stack

- Backend: Spring Boot (Java 17+), PostgreSQL with PostGIS, Maven
- Frontend Web: Next.js, React 19, TypeScript, Tailwind CSS, Ant Design
- Frontend Mobile: React Native
- Database: PostgreSQL 15 with PostGIS
- Infrastructure: Docker & Docker Compose
