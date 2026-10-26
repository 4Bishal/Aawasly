<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/branding/logo-dark.png" />
    <img src="public/branding/logo-light.png" alt="Aawasly logo" width="360" />
  </picture>
</p>

<h1 align="center">Aawasly | Where Stays Begin</h1>

<p align="center">
  Thoughtful spaces. Memorable stays.<br />
  A full-stack accommodation discovery and property listing platform built by
  <a href="https://bhandari-bishal.com.np/">Bishal Bhandari</a>.
</p>

<p align="center">
  <a href="https://aawasly.vercel.app/">Live Demo</a> ·
  <a href="#features">Features</a> ·
  <a href="#getting-started">Getting Started</a> ·
  <a href="#deployment">Deployment</a> ·
  <a href="docs/DEVELOPMENT.md">Developer Guide</a>
</p>

## About the project

Aawasly helps people discover places to stay, explore property details, and share their experiences through ratings and reviews. Hosts can create and manage their own listings, upload photos, and show their property's location on an interactive map.

I originally built Aawasly with Node.js, Express, EJS, and MongoDB, then migrated it to Next.js App Router and TypeScript. The current application brings together a responsive interface, server-rendered pages, secure authentication, and reusable validation while preserving existing accounts and listing data.

## Live demo

**Coming soon — the Vercel deployment link will be added here.**

<!-- After deploying, replace the sentence above with the following Markdown,
     substituting your real public URL for YOUR_VERCEL_DEPLOYMENT_URL:

     [Open Aawasly — Live Demo](YOUR_VERCEL_DEPLOYMENT_URL)

     Also set NEXTAUTH_URL in Vercel to the same public HTTPS origin.
-->

**Source code:** [github.com/4Bishal/Aawasly](https://github.com/4Bishal/Aawasly)

## Features

- **Discover stays:** Responsive listing grids, property details, and image galleries.
- **Search and filter:** Debounced destination search, categories, price ranges, ratings, amenities, sorting, and pagination.
- **Host your space:** Create, edit, and delete listings with server-side ownership checks.
- **Photos:** Signed Cloudinary uploads with file format, ownership, and size verification.
- **Interactive maps:** MapTiler geocoding and light/dark property maps.
- **Reviews and ratings:** Add reviews, delete your own reviews, and see optimistic updates with rollback when a request fails.
- **Authentication:** NextAuth credentials login, HTTP-only JWT sessions, and compatibility with existing Passport passwords.
- **NPR pricing:** Nepalese rupee formatting and a shared toggle for displaying prices with 13% VAT included.
- **Theme preferences:** Light, Dark, and System modes through one floating theme control, with saved preferences.
- **Consistent branding:** Theme-specific logos, app icons, favicons, and social sharing metadata.
- **Loading and error states:** Skeleton loaders, route fallbacks, toast notifications, and keyboard focus indicators.

This phase covers property discovery, hosting, and reviews. Reservations, availability calendars, payments, and wishlists are not implemented.

## Preview

![Aawasly brand preview — Where Stays Begin](public/branding/social-preview.png)

### Application screenshots

Screenshots will be added after deployment. Planned views include the explore page in both themes, a property detail page, and the listing creation form.

<!-- Add actual application screenshots when available. Example:
     ![Explore stays in light mode](docs/screenshots/explore-light.png)
     Create the screenshot file before enabling this image link.
-->

## Tech stack

| Area                 | Technology                                                         |
| -------------------- | ------------------------------------------------------------------ |
| Framework            | Next.js 16 App Router, React 19, Server Components, Server Actions |
| Language             | TypeScript with strict mode                                        |
| Styling              | Tailwind CSS 4, shadcn-style Radix UI primitives, Lucide React     |
| Themes               | next-themes                                                        |
| Database             | MongoDB Atlas and Mongoose                                         |
| Authentication       | NextAuth.js with credentials and JWT sessions                      |
| Forms and validation | React Hook Form and Zod                                            |
| Client data          | TanStack Query with optimistic mutations                           |
| Media                | Cloudinary                                                         |
| Maps                 | MapTiler SDK and geocoding API                                     |
| Notifications        | Sonner                                                             |
| Testing              | Vitest, Testing Library, and a disposable MongoDB replica set      |
| Deployment target    | Vercel                                                             |

## Getting started

### Prerequisites

- Node.js 22.15.1 or newer within the supported 22 or 24 release lines, and npm.
- An active MongoDB Atlas cluster or a local MongoDB replica set. Transactions require a replica set.
- Cloudinary and MapTiler credentials.

### 1. Clone and install

```bash
git clone https://github.com/4Bishal/Aawasly.git
cd Aawasly
```

Until the Next.js migration is merged into `main`, check out its branch before installing:

```bash
git switch refactor/aawasly-nextjs-migration
```

Install the dependencies:

```bash
npm ci
```

### 2. Configure the environment

Copy [.env.example](.env.example) to `.env.local` and fill in your own values:

```bash
cp .env.example .env.local
```

On PowerShell, use `Copy-Item .env.example .env.local`.

| Variable                   | Description                                                             |
| -------------------------- | ----------------------------------------------------------------------- |
| `MONGODB_URI`              | Connection URI for your intended MongoDB database                       |
| `NEXTAUTH_URL`             | `http://localhost:3000` locally; your public HTTPS origin when deployed |
| `NEXTAUTH_SECRET`          | A random secret of at least 32 characters                               |
| `CLOUDINARY_CLOUD_NAME`    | Your Cloudinary cloud name                                              |
| `CLOUDINARY_API_KEY`       | Your Cloudinary API key                                                 |
| `CLOUDINARY_API_SECRET`    | Your server-only Cloudinary API secret                                  |
| `MAPTILER_API_KEY`         | Your server-side geocoding key                                          |
| `NEXT_PUBLIC_MAPTILER_KEY` | Your browser-visible map key, restricted to your approved domains       |

Generate a session secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Keep `.env.local` out of version control. Only the browser MapTiler key uses the `NEXT_PUBLIC_` prefix.

If you already have the legacy `.env`, `npm run setup:env` can create `.env.local` from it instead. The script does not overwrite an existing `.env.local` or change database records.

### 3. Start the application

```bash
npm run dev
```

Open [http://localhost:3000/listing](http://localhost:3000/listing).

If PowerShell blocks `npm.ps1`, use `npm.cmd` in place of `npm`.

## Available scripts

| Command                    | Purpose                                                       |
| -------------------------- | ------------------------------------------------------------- |
| `npm run dev`              | Start the local development server                            |
| `npm run build`            | Create a production build                                     |
| `npm start`                | Serve the production build                                    |
| `npm run typecheck`        | Check TypeScript types                                        |
| `npm test`                 | Run unit and DOM tests                                        |
| `npm run test:integration` | Run isolated replica-set integration tests                    |
| `npm run format`           | Format the application and supporting files                   |
| `npm run setup:env`        | Create local configuration from legacy environment variables  |
| `npm run db:indexes`       | Explicitly create required indexes in the configured database |

## Project structure

```text
src/
  app/          Pages, layouts, API routes, and metadata
  components/   Branding, forms, listings, maps, reviews, and shared UI
  providers/    Theme, session, query, and pricing providers
  lib/          Server Actions, services, authentication, validation, and utilities
  models/       Typed Mongoose models
  types/        Shared database and application types
public/
  branding/     Logos, app icons, and social preview artwork
scripts/        Environment setup, index maintenance, and isolated QA tools
tests/          Unit, DOM, and database integration tests
docs/           Development guide and migration commit reference
```

## Migration notes

The active application lives under `src/`. Most original Express/EJS files remain in the repository as migration references; the npm scripts run Next.js.

- Existing MongoDB collections, document IDs, listing ownership, and review relationships are preserved.
- Existing Passport password hashes are verified and upgraded after successful login.
- The original Express middleware was renamed to `legacy-middleware.js` to avoid Next.js middleware discovery.
- The previous manifest was replaced by the branded `/manifest.webmanifest`.
- Legacy Express, EJS, Passport, and Joi packages are no longer application dependencies.

See the [development and migration guide](docs/DEVELOPMENT.md) for architecture, API routes, database compatibility, branding, and isolated preview instructions. The [migration commit reference](docs/MIGRATION_COMMITS.md) records the ten original migration commits and their file groups.

## Quality checks

```bash
npm run typecheck
npm test
npm run test:integration
npm run build
```

Integration tests use a disposable MongoDB replica set rather than your Atlas database. The first run may download a MongoDB binary. Live Cloudinary uploads, MapTiler requests, and visual browser checks should also be verified in the deployment environment.

## Deployment

The deployment target is **Vercel**, with MongoDB Atlas as the database.

1. Import the GitHub repository into Vercel and select the branch containing the Next.js application.
2. Add the variables from `.env.example` to the appropriate Vercel environments.
3. Set `NEXTAUTH_URL` to the deployment's public HTTPS origin. Configure `NEXT_PUBLIC_MAPTILER_KEY` before building.
4. Ensure the Atlas cluster is active and its network access permits your deployment to connect. Use separate databases for preview and production.
5. Run `npm run db:indexes` from a trusted environment pointed at the intended database before production traffic.
6. Build with `npm run build`, then verify login, listings, uploads, maps, and reviews.
7. Replace the **Live demo** placeholder near the top of this README with your deployed URL.

Detailed deployment and index-maintenance instructions are in [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md#deploy-to-vercel).

## Author

**Bishal Bhandari**

- [Portfolio](https://bhandari-bishal.com.np/)
- [LinkedIn](https://www.linkedin.com/in/bishal-bhandari-a63b8926a)
- [GitHub](https://github.com/4Bishal)

Built as a full-stack project exploring property discovery, modern authentication, responsive interfaces, and migration from an Express/EJS application to Next.js.
