# PhantomPay - Digital Wallet Application

## Overview

PhantomPay is a full-stack digital wallet application designed for the Kenyan market. It provides comprehensive financial services including peer-to-peer transfers, savings accounts, mobile money integration, and referral programs. The application is built with a modern React frontend and Express.js backend, utilizing PostgreSQL for data persistence and Firebase for authentication.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Components**: Radix UI primitives with custom Tailwind CSS styling
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with custom design tokens for PhantomPay branding

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety
- **Database ORM**: Drizzle ORM for PostgreSQL interactions
- **Authentication**: Firebase Authentication with JWT tokens
- **Database**: PostgreSQL (configured for Neon Database)
- **Session Management**: Express sessions with PostgreSQL storage

### Database Design
The application uses a relational PostgreSQL database with the following core tables:
- **users**: User profiles with wallet/savings balances and KYC status
- **transactions**: All financial transactions with comprehensive metadata
- **savings_accounts**: Time-locked savings products with interest calculations
- **referrals**: User referral tracking and rewards

## Key Components

### Authentication System
- Firebase Authentication for user management
- JWT token-based API authentication
- Protected routes with automatic redirects
- Social login (Google) and email/password authentication

### Financial Transaction Engine
- Multi-type transaction support (P2P, deposits, withdrawals, airtime, savings)
- Dynamic fee calculation based on transaction amount and type
- Transaction status tracking (pending, success, failed)
- Comprehensive transaction history and metadata storage

### Savings System
- Multiple savings products with different lock periods (1, 3, 6, 12 months)
- Tiered interest rates based on commitment duration
- Automatic interest calculation and compounding
- Early withdrawal penalties and maturity tracking

### User Interface
- Responsive design optimized for mobile and desktop
- Dark/light mode support with CSS custom properties
- Sidebar navigation for desktop, bottom tab navigation for mobile
- Modal-based transaction flows for better UX
- Real-time balance updates and transaction notifications

## Data Flow

1. **User Authentication**: Firebase handles user registration/login, returns JWT token
2. **API Requests**: Frontend sends authenticated requests with Bearer tokens
3. **Database Operations**: Express routes use Drizzle ORM to interact with PostgreSQL
4. **Real-time Updates**: TanStack Query manages cache invalidation and data synchronization
5. **State Management**: React Query caches server state, React hooks manage local state

## External Dependencies

### Core Technologies
- **Firebase**: Authentication and user management
- **Neon Database**: Serverless PostgreSQL hosting
- **Replit**: Development environment and deployment platform

### Key Libraries
- **@neondatabase/serverless**: PostgreSQL driver optimized for serverless
- **drizzle-orm**: Type-safe ORM with excellent TypeScript integration
- **@tanstack/react-query**: Powerful data fetching and caching
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Minimalist routing library
- **nanoid**: Secure unique ID generation

## Deployment Strategy

### Development Environment
- Replit-based development with hot module replacement
- Vite dev server with Express API proxy
- PostgreSQL database provisioned automatically
- Environment variables managed through Replit secrets

### Production Build
- Vite builds static assets to `dist/public`
- Express server bundle created with esbuild
- Static file serving through Express
- Single-port deployment (5000) with internal routing

### Database Management
- Drizzle Kit for schema migrations
- Environment-based database URL configuration
- Automatic schema synchronization via `db:push` command

## Recent Changes

- **June 20, 2025**: Dashboard customization completed
  - Updated dashboard to match user-provided screenshot designs
  - Fixed balance display to show zero until actual transactions are made
  - Dynamic welcome message showing actual user's display name
  - Clean layout with proper gradient cards and savings plans section
  - Responsive design optimized for both mobile and desktop views

- **June 19, 2025**: Authentication system fully operational
  - Firebase authentication successfully configured with fresh project credentials
  - Google sign-in working with proper domain authorization
  - Complete user authentication flow operational with `google.demo@phantompay.com`
  - All application features accessible and fully functional

- **June 17, 2025**: Database migration completed
  - Migrated from in-memory storage to PostgreSQL database
  - Implemented full database storage layer with Drizzle ORM
  - All user data, transactions, savings accounts, and referrals now persist in database
  - Added comprehensive error handling and Firebase authentication debugging
  - Created debug page for troubleshooting authentication issues

- **June 17, 2025**: Initial setup completed
  - Full-stack digital wallet application architecture established
  - Firebase authentication integrated with comprehensive error handling
  - Dynamic fee calculation engine implemented per Kenya market standards
  - Savings accounts with 6-12% interest rates and compound calculations
  - Real-time dashboard with balance tracking and transaction history

## User Preferences

Preferred communication style: Simple, everyday language.