# Şikayetbet - Complaint Management System

A comprehensive complaint management platform built with Next.js, Socket.IO, and Prisma.

## Features

- User authentication and authorization
- Company registration and verification
- Complaint submission with image uploads
- Real-time messaging system with Socket.IO
- Admin dashboard for managing complaints and companies
- Support ticket system for companies
- Responsive design with Tailwind CSS

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- SQLite (for development) or PostgreSQL (for production)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the `.env.example` file to `.env` and update the values:

```bash
cp .env.example .env
```

Update the following variables in `.env`:
- `JWT_SECRET` - Change to a strong secret key
- Database credentials
- AWS S3 credentials for file uploads
- SMTP credentials for email notifications

### 3. Database Setup

Run the database migrations:

```bash
npx prisma migrate dev
```

Seed the database with initial data:

```bash
npx prisma db seed
```

### 4. Running the Application

#### Development Mode

```bash
npm run dev
```

The application will be available at http://localhost:3000

#### Production Mode

First, build the application:

```bash
npm run build
```

Then start the server:

```bash
npm start
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection with allowed origins
- Secure HTTP headers
- Input validation with Zod
- Rate limiting (to be implemented)
- XSS protection (to be implemented)

## Architecture

The application follows a modern Next.js architecture with:

- API routes for backend functionality
- Server-side rendering for improved SEO
- Real-time communication with Socket.IO
- Prisma ORM for database operations
- Tailwind CSS for styling

## Deployment

For production deployment, make sure to:

1. Set `NODE_ENV=production` in your environment variables
2. Use a production database (PostgreSQL recommended)
3. Configure proper SSL certificates
4. Set up proper environment variables for production
5. Use a process manager like PM2 for running the application

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue on the GitHub repository.