# PetSStay — Pet Boarding & Booking Platform

A full-stack pet boarding web application for booking professional cat and dog care services in Limassol, Cyprus.

🌐 **Live Demo:**  
https://petsstay-your-pet-s-second-home.vercel.app/

💻 **GitHub Repository:**  
https://github.com/Inna-code10/petsstay-your-pet-s-second-home

---

## Overview

PetSStay is a responsive pet boarding and booking platform designed to provide a simple and convenient way for pet owners to arrange professional care for their cats and dogs.

The application combines a modern React frontend with Supabase backend services and includes authentication, booking management, multilingual support, database integration, and transactional email functionality.

The project was developed as a personal full-stack portfolio project with a focus on responsive UI, practical user flows, backend integration, and secure handling of environment variables.

---

## Key Features

- Online pet boarding booking
- User registration and authentication
- Booking creation and management
- Cat and dog care services
- Service and pricing information
- Multilingual interface:
  - English
  - Russian
  - Greek
- Responsive design for desktop, tablet, and mobile devices
- Supabase database integration
- PostgreSQL data storage
- Transactional booking emails
- Supabase Edge Functions
- Resend email integration
- Secure environment variable management
- Production deployment with Vercel

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

### Backend & Database

- Supabase
- PostgreSQL
- Supabase Authentication
- Supabase Edge Functions

### Email

- Resend

### Deployment & Development

- Vercel
- Git
- GitHub
- npm

---

## Application Architecture

PetSStay uses Supabase as the backend platform for authentication, database operations, and server-side functionality.

The React application communicates with Supabase using environment variables provided through Vite.

Transactional booking emails are handled separately through a Supabase Edge Function and Resend.

```text
React / TypeScript
        │
        ▼
     Supabase
   ┌────┴─────┐
   │          │
   ▼          ▼
Auth      PostgreSQL
              │
              ▼
       Supabase Edge Function
              │
              ▼
            Resend
              │
              ▼
        Booking Emails
```

---

## Environment Variables

Environment variables are used to keep configuration and sensitive credentials outside the source code.

The repository contains a `.env.example` file showing the required variable names without exposing real credentials.

### Frontend

```env
VITE_SUPABASE_PROJECT_ID=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_URL=
```

### Supabase

```env
SUPABASE_PROJECT_ID=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_URL=
```

### Supabase Edge Function / Email

```env
RESEND_API_KEY=
PETSSTAY_ADMIN_EMAIL=
PETSSTAY_FROM_EMAIL=
SUPABASE_SERVICE_ROLE_KEY=
```

> Sensitive values such as API keys and service role credentials are not committed to the repository.

---

## Transactional Emails

PetSStay uses a Supabase Edge Function to send transactional booking emails through Resend.

The email functionality supports booking-related events such as:

- Booking created
- Booking confirmed
- Booking cancelled
- Booking completed

Server-side credentials are accessed through environment variables rather than being hardcoded in the application source code.

---

## Multilingual Support

The application supports three interface languages:

- 🇬🇧 English
- 🇷🇺 Russian
- 🇬🇷 Greek

Users can switch languages directly from the navigation interface.

---

## Responsive Design

PetSStay is designed to work across different screen sizes, including:

- Desktop
- Tablet
- Mobile

The interface adapts navigation, content sections, booking elements, and layouts for smaller screens.

---

## AI-Assisted Development

AI-assisted development tools were used during parts of the development process to support UI prototyping, code generation, debugging, and development workflow.

The project was reviewed and refined manually, including:

- application structure;
- frontend and backend integration;
- Supabase configuration;
- environment variable management;
- Git and GitHub configuration;
- deployment configuration;
- security review;
- debugging and testing.

This project demonstrates practical experience working with AI-assisted development while maintaining understanding and control of the resulting application architecture and codebase.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Inna-code10/petsstay-your-pet-s-second-home.git
```

### 2. Open the project

```bash
cd petsstay-your-pet-s-second-home
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a local `.env` file based on `.env.example`.

```bash
cp .env.example .env
```

Add your own Supabase configuration values to the local `.env` file.

Do not commit the `.env` file to GitHub.

### 5. Start the development server

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

---

## Deployment

The frontend is deployed with Vercel.

Production environment variables are configured securely through Vercel rather than being stored in the GitHub repository.

Supabase Edge Function secrets are managed separately in the server-side Supabase environment.

🌐 **Live Application:**  
https://petsstay-your-pet-s-second-home.vercel.app/

---

## Security

The project follows basic security practices for handling application credentials:

- `.env` is excluded from Git tracking
- `.env.example` contains variable names only
- API credentials are not hardcoded in source files
- Supabase service role credentials are kept server-side
- Edge Function secrets are accessed through environment variables
- Production frontend variables are managed through Vercel

---

## Project Status

PetSStay is a completed personal portfolio project and is deployed online.

The application demonstrates full-stack development skills including frontend development, authentication, database integration, server-side functions, transactional emails, deployment, and environment configuration.