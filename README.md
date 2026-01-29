# HospiAI - Medical AI Platform

A modern, secure medical AI web application built with Next.js 14, featuring intelligent symptom analysis, appointment management, and hospital availability tracking.

## Features

- **Secure Authentication**: NextAuth (Auth.js) with credentials provider (email + password)
- **User Management**: Sign up, sign in, and profile management
- **JWT Sessions**: Secure, stateless authentication with 7-day expiration
- **Temporary Access Tokens**: Generate and manage tokens for external integrations (e.g., Mistral MCP)
- **Dashboard**: Comprehensive health overview with appointments, analyses, and hospital data
- **Modern UI**: Clean, responsive design with shadcn/ui components
- **Type-Safe**: Full TypeScript support throughout the codebase
- **Database**: PostgreSQL with Prisma ORM

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Authentication**: NextAuth (Auth.js) with Credentials Provider
- **Database**: PostgreSQL
- **ORM**: Prisma
- **UI**: shadcn/ui + TailwindCSS
- **Password Hashing**: bcrypt
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database
- Yarn or npm

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd hospiai
```

2. **Install dependencies**

```bash
yarn install
# or
npm install
```

3. **Set up environment variables**

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Required environment variables:

- `DATABASE_URL`: Your PostgreSQL connection string
- `AUTH_SECRET`: Generate with `openssl rand -base64 32`
- `AUTH_URL`: Your app URL (default: http://localhost:3000)

4. **Generate Prisma Client**

```bash
npx prisma generate
```

5. **Run database migrations**

```bash
npx prisma migrate dev
```

Or use Prisma's built-in local database:

```bash
npx prisma dev
```

6. **Run the development server**

```bash
yarn dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
hospiai/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts   # NextAuth handler
│   │   │   └── register/route.ts        # User registration
│   │   └── tokens/route.ts              # Token management API
│   ├── dashboard/
│   │   ├── appointments/page.tsx        # Appointments page
│   │   ├── analyses/page.tsx            # Analyses page
│   │   ├── hospitals/page.tsx           # Hospitals page
│   │   ├── settings/page.tsx            # Settings page
│   │   ├── tokens/page.tsx              # Token management
│   │   ├── layout.tsx                   # Dashboard layout
│   │   └── page.tsx                     # Dashboard home
│   ├── login/page.tsx                   # Login page
│   ├── register/page.tsx                # Registration page
│   ├── layout.tsx                       # Root layout
│   ├── page.tsx                         # Home (redirects)
│   └── globals.css                      # Global styles
├── components/
│   ├── dashboard/
│   │   ├── header.tsx                   # Dashboard header
│   │   └── nav.tsx                      # Dashboard navigation
│   ├── ui/                              # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── label.tsx
│   └── logo.tsx                         # HospiAI logo
├── lib/
│   ├── prisma.ts                        # Prisma client
│   └── utils.ts                         # Utility functions
├── prisma/
│   └── schema.prisma                    # Database schema
├── types/
│   └── next-auth.d.ts                   # NextAuth type extensions
├── auth.ts                              # NextAuth configuration
├── middleware.ts                        # Route protection
└── package.json
```

## Database Schema

### User Model
- `id`: Unique identifier (CUID)
- `email`: Unique email address
- `password`: Bcrypt hashed password
- `firstname`: User's first name
- `surname`: User's surname
- `createdAt`: Account creation timestamp
- `updatedAt`: Last update timestamp

### TempToken Model
- `id`: Unique identifier (CUID)
- `token`: Unique access token (CUID)
- `userId`: Foreign key to User
- `expiresAt`: Token expiration date (7 days)
- `createdAt`: Token creation timestamp

## Authentication Flow

### Sign Up
1. User fills registration form (firstname, surname, email, password)
2. Email uniqueness is validated
3. Password is hashed with bcrypt (12 rounds)
4. User is created in database
5. User is automatically signed in

### Sign In
1. User enters email and password
2. Credentials are validated via NextAuth
3. JWT token is generated with user data
4. Session is created (7-day expiration)
5. User is redirected to dashboard

### Protected Routes
- All `/dashboard/*` routes require authentication
- Middleware checks session and redirects unauthenticated users to `/login`
- Authenticated users are redirected from `/login` and `/register` to `/dashboard`

## Token System

### Token Generation
- Users can generate temporary access tokens from `/dashboard/tokens`
- Each token is valid for 7 days
- Tokens are stored in the database with expiration timestamps
- Tokens are automatically displayed and copied on creation

### Token Management
- View all active and expired tokens
- Revoke tokens at any time
- Copy token to clipboard
- Tokens are linked to specific users and can't be used by others

### External Integration
Tokens can be used by external applications (e.g., Mistral MCP) to access user data securely.

## Security Features

- **Password Security**: Bcrypt hashing with 12 rounds
- **No User Enumeration**: Generic error messages prevent revealing if emails exist
- **JWT Sessions**: Stateless, secure authentication
- **Route Protection**: Middleware-based authentication checks
- **Token Expiration**: Automatic expiration after 7 days
- **Token Revocation**: Users can revoke tokens at any time
- **Environment Variables**: Sensitive data in .env file

## Development

### Available Scripts

- `yarn dev`: Run development server
- `yarn build`: Build for production
- `yarn start`: Start production server
- `yarn lint`: Run ESLint
- `npx prisma studio`: Open Prisma Studio (database GUI)
- `npx prisma migrate dev`: Create and apply migrations
- `npx prisma generate`: Generate Prisma Client

### Adding New Features

1. **Database Changes**: Update `prisma/schema.prisma` and run migrations
2. **API Routes**: Add to `app/api/`
3. **Pages**: Add to `app/` or `app/dashboard/`
4. **Components**: Add to `components/`
5. **Types**: Add to `types/` or extend existing types

## Production Deployment

1. **Set Environment Variables**: Update `.env` with production values
2. **Generate Auth Secret**: `openssl rand -base64 32`
3. **Run Database Migrations**: `npx prisma migrate deploy`
4. **Build Application**: `yarn build`
5. **Start Server**: `yarn start`

### Deployment Platforms

- **Vercel**: Automatic deployment with GitHub integration
- **Railway**: Easy PostgreSQL + Next.js deployment
- **Netlify**: Supports Next.js with adapter
- **Self-hosted**: Use Docker or traditional VPS

## License

MIT

## Contributors

- Your Name <your.email@example.com>

## Support

For issues and questions, please open an issue on GitHub.
