# Ascend Project

A full-stack web application built with Node.js, Express, React, and SQLite.

## Tech Stack

- **Backend:** Node.js, Express, TypeScript
- **Frontend:** React, Vite, TailwindCSS
- **Database:** SQLite with Drizzle ORM
- **UI Components:** Radix UI, shadcn/ui
- **Authentication:** Passport.js (local strategy)

## Prerequisites

- Node.js 20+
- npm (comes with Node.js)

## First-time Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up the database:**
   ```bash
   npm run db:push
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes

## Project Structure

```
├── client/          # React frontend application
├── server/          # Express backend application
├── shared/          # Shared types and utilities
├── script/          # Build and utility scripts
└── drizzle.config.ts # Database configuration
```

## Development

The development server includes:
- Hot reload for both frontend and backend
- TypeScript compilation
- Database migrations via Drizzle

## Database

This project uses SQLite as the database with Drizzle ORM as the query builder. The database file is `blockstacker.db` in the root directory.
