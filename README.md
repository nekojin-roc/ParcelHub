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
cd ParcelHub
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

# Generate Prisma client, compile host commands, and create the database
npx prisma generate
npm run build
npm run db:migrate:deploy
# (Optional) Seed the database with sample data
npx prisma db seed
```

### 3. Start Mailpit and development servers

Start the local email catcher. Its inbox is available at
http://localhost:8025, and ParcelHub sends development mail to its SMTP port
at `localhost:1025`.

```bash
npm run mail:up
```

Open two terminal windows:

```bash
# Terminal 1: Start the backend (runs on port 3001)
cd ParcelHub
npm run dev

# Terminal 2: Start the frontend (runs on port 5173)
cd client
npm run dev
```

### 4. Open in browser

Navigate to http://localhost:5173

New accounts receive one verification message after signup. Verification does
not block sign-in and is not re-sent during sign-in. Password-reset links are
also delivered to Mailpit. Stop Mailpit with `npm run mail:down` when it is no
longer needed.

### 5. Promote the first administrator

Every public signup starts as a normal user. After the first account verifies
its email, promote it from the host running ParcelHub:

```bash
# Development source
npm run admin:promote:dev -- admin@example.com

# Built production server
npm run build
npm run admin:promote -- admin@example.com
```

For a containerized server, run the same production command inside the server
container so it uses that container's `DATABASE_URL` and database volume.

```bash
docker compose exec server npm run admin:promote -- admin@example.com
```

The command is idempotent and refuses to promote an unverified account. The
host operator can add `--allow-unverified` for deliberate recovery, but normal
bootstrap should always verify the address first. Complete the first signup and
promotion before exposing a clean installation: only the first account can
register without a referral code.

## Tech Stack

| Layer            | Technology                                      |
| ---------------- | ----------------------------------------------- |
| Frontend         | React 19, TypeScript, Vite, shadcn/ui, Tailwind, i18next |
| Backend          | Fastify, TypeScript                             |
| Database         | SQLite via Prisma ORM                           |
| Email            | Nodemailer; Mailpit for local development       |
| Authentication   | Better Auth (email/password, cookie sessions)   |
| Barcode Generate | bwip-js                                         |
| Barcode Scan     | html5-qrcode (camera), HID mode (USB scanner)   |
| Package Photos   | Private local files in `uploads/packages/`       |

Frontend translation keys and locale resources follow the conventions in
[`docs/i18n.md`](docs/i18n.md).

## Key Concepts

- **Recipients**: Your friends who receive mail at your address.
- **Packages**: Individual items received, each assigned a unique barcode.
- **Bins**: Storage locations in your home (shelves, boxes, etc.).
- **Intake**: The process of logging a new package and notifying the recipient.
- **Pickup**: Scanning a barcode to mark a package as collected.

## Authentication and photos

- Create the first account at `/auth`, verify its email, and promote it with the
  host-side `admin:promote` command. Public signup always assigns the normal-user
  role, and application startup never promotes an account automatically.
- The first account can register without a referral code so a clean install can
  establish its initial account. After that, registration requires an active,
  single-use referral code. Administrators generate and view active codes on
  the **Registered Users** page; each code leaves the active list when used.
- Account creation sends a one-time verification email, but verification is
  not required for sign-in. The sign-in page also provides a password-reset
  flow; completing it revokes the account's existing sessions.
- Administrators use the operational dashboard, intake, pickup, recipient,
  user, package, and settings pages. The **Registered Users** page links each
  account to one recipient profile. Normal users are redirected to **My
  Packages**, where they can read package status and photos only for their
  linked recipient.
- Package photos are optional. The intake form accepts JPEG, PNG, and WebP
  images up to 5 MB; they can be replaced or deleted after registration.
  Files are stored outside the database and served only through authenticated
  package-photo endpoints. Set `UPLOAD_DIR` to choose a different storage root.
- Every installation includes a permanent **Uncategorized** storage bin.
  Packages submitted without a selected location are assigned to it
  automatically; the system bin cannot be renamed or deleted.

## Host-side production commands

Host commands operate directly on the database, SMTP server, or upload storage;
they do not expose maintenance HTTP endpoints. Run `npm run build` after pulling
new code so the compiled commands in `dist/commands/` match the source. Commands
inside Docker should be prefixed with `docker compose exec server`, for example:

```bash
docker compose exec server npm run ops:doctor
```

All commands use `DATABASE_URL`, `UPLOAD_DIR`, and the SMTP variables from the
server environment. They return a nonzero exit code when validation or a safety
check fails.

### Administrator management

```bash
# List administrators, verification/disabled state, and session counts
npm run admin:list

# Promote an existing verified account
npm run admin:promote -- admin@example.com

# Recovery-only override for an intentionally unverified account
npm run admin:promote -- admin@example.com --allow-unverified

# Demote an administrator and revoke all of that account's sessions
npm run admin:demote -- admin@example.com
```

`admin:demote` refuses to remove the final active administrator. Promote another
verified account first. Promotion is idempotent, and public registration never
grants the administrator role.

### User and session incident response

```bash
# Immediately sign an account out everywhere
npm run sessions:revoke -- --email user@example.com

# Block sign-in, revoke sessions, and retain an operator-visible reason
npm run user:disable -- --email user@example.com --reason "Compromised account"

# Restore sign-in access; the user must sign in again
npm run user:enable -- --email user@example.com
```

Disabling the last active administrator is refused. Disabled accounts are
checked both when a session is created and when protected APIs authenticate an
existing session.

### Referral code recovery

```bash
# Generate one or more codes on behalf of an active administrator
npm run referral:create -- --admin admin@example.com
npm run referral:create -- --admin admin@example.com --count 5

# Revoke an unused code while retaining it for audit history
npm run referral:revoke -- --code PH-ABCD-2345 --confirm PH-ABCD-2345
```

Only active, unused, non-revoked codes appear in the application or can be used
for registration. `--count` accepts values from 1 through 20.

### Database migrations

```bash
# Show migration status
npm run db:migrate:status

# Create a missing SQLite file and apply committed production migrations
npm run db:migrate:deploy
```

Fresh installations only need `db:migrate:deploy`. An existing installation
created with `prisma db push` has no migration history and must be adopted once:

```bash
npm run build
npm run db:backup -- --output /secure/backups/pre-migration
# Stop the ParcelHub server before changing its schema.
npm run db:migrate:baseline
npm run db:migrate:deploy
npm run db:migrate:status
```

`db:migrate:baseline` verifies that all original ParcelHub tables exist. It
detects whether the account-control columns are already present and marks only
the migrations represented by the existing schema. Do not use `db:push` for
production upgrades.

### Database backup, restore, and integrity

```bash
# Online SQLite snapshot plus uploads and SHA-256 manifest
npm run db:backup
npm run db:backup -- --output /secure/backups/parcelhub-2026-08-19

# Fast routine check or complete check
npm run db:check -- --quick
npm run db:check

# Destructive restore; the ParcelHub server must be stopped first
npm run db:restore -- --from /secure/backups/parcelhub-2026-08-19 --confirm RESTORE
```

Restore verifies database and upload checksums before changing active files. It
retains the previous database and upload directory with a `.pre-restore-*`
suffix so the operation remains recoverable. Review and remove those safety
copies manually only after the restored installation has been verified.

### Mail diagnostics

```bash
npm run mail:test -- --to operator@example.com
```

This verifies the SMTP connection and sends one clearly identified diagnostic
message without creating recipients or packages.

### Upload reconciliation

```bash
# Read-only report of missing, unsafe, and orphaned package photos
npm run uploads:check

# Delete only unreferenced regular files
npm run uploads:check -- --delete-orphans --confirm DELETE-ORPHANS
```

The deletion mode never removes a database-referenced file. Missing or unsafe
database references always produce a failing exit code for operator review.

### Production readiness doctor

```bash
npm run ops:doctor
npm run ops:doctor -- --skip-smtp
```

The doctor checks the Node version, `NODE_ENV`, authentication secret, public
URLs, SQLite integrity, foreign keys, active administrators, migration history,
upload permissions, and SMTP connectivity. `--skip-smtp` records a warning
rather than contacting the configured mail server. Production environments
should set `NODE_ENV=production`; the Docker image does this automatically.
