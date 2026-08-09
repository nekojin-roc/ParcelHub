# ParcelHub - Personal Package Management System

A lightweight, self-hosted package management system for receiving, tracking, and
distributing packages on behalf of friends and contacts.

## Architecture

```
parcel-hub/
├── client/          # React + TypeScript + Vite + shadcn/ui
├── src/             # Fastify + TypeScript API
├── prisma/          # SQLite schema and seed script
├── docker-compose.yml
└── README.md
```

## Prerequisites

- Node.js >= 20.19
- npm >= 10.x
- (Optional) Docker & Docker Compose for containerized deployment

## Quick Start (Development)

### 1. Clone and install

```bash
# Install server dependencies
cd HomeInventory
npm install

# Install client dependencies
cd client
npm install
```

### 2. Set up the database

```bash
cd ..

# Copy the example env file and edit it
cp .env.example .env
# Edit .env to configure auth and SMTP. Set BETTER_AUTH_SECRET to a long,
# random value (for example: openssl rand -base64 32).

# Generate Prisma client and create the database
npx prisma generate
npx prisma db push
# (Optional) Seed the database with sample data
npx prisma db seed
```

### 3. Start development servers

Open two terminal windows:

```bash
# Terminal 1: Start the backend (runs on port 3001)
cd HomeInventory
npm run dev

# Terminal 2: Start the frontend (runs on port 5173)
cd client
npm run dev
```

### 4. Open in browser

Navigate to http://localhost:5173

## Tech Stack

| Layer            | Technology                                      |
| ---------------- | ----------------------------------------------- |
| Frontend         | React 19, TypeScript, Vite, shadcn/ui, Tailwind |
| Backend          | Fastify, TypeScript                             |
| Database         | SQLite via Prisma ORM                           |
| Email            | Nodemailer (any SMTP provider)                  |
| Authentication   | Better Auth (email/password, cookie sessions)   |
| Barcode Generate | bwip-js                                         |
| Barcode Scan     | html5-qrcode (camera), HID mode (USB scanner)   |
| Package Photos   | Private local files in `uploads/packages/`       |

## Key Concepts

- **Recipients**: Your friends who receive mail at your address.
- **Packages**: Individual items received, each assigned a unique barcode.
- **Bins**: Storage locations in your home (shelves, boxes, etc.).
- **Intake**: The process of logging a new package and notifying the recipient.
- **Pickup**: Scanning a barcode to mark a package as collected.

## Authentication and photos

- Create the first account at `/auth`, then sign in with email and password.
  The first (or oldest existing) account is the administrator; later sign-ups
  are normal users. Roles are assigned by the server and cannot be selected at
  sign-up.
- Administrators use the operational dashboard, intake, pickup, recipient,
  user, package, and settings pages. The **Registered Users** page links each
  account to one recipient profile. Normal users are redirected to **My
  Packages**, where they can read package status and photos only for their
  linked recipient.
- Package photos are optional. The intake form accepts JPEG, PNG, and WebP
  images up to 5 MB; they can be replaced or deleted after registration.
  Files are stored outside the database and served only through authenticated
  package-photo endpoints. Set `UPLOAD_DIR` to choose a different storage root.
