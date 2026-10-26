# Aawasly development and migration guide

A Next.js App Router migration of the original Express/EJS rental and review application, targeting Vercel and MongoDB Atlas. Prices are stored in **NPR before tax**; the shared display preference calculates **13% VAT** without changing stored prices. Light, Dark, and System themes use `next-themes` and shared Tailwind color tokens.

## Run locally

Requires Node.js 22.15.1 or newer (22 or 24), npm, and an Atlas database or MongoDB replica set. Transactions require a replica set; a standalone local `mongod` is not sufficient.

```sh
npm ci
npm run setup:env
npm run dev
```

Open http://localhost:3000/listing. On Windows PowerShell with execution policy restrictions, use `npm.cmd` instead of `npm`.

`setup:env` creates an ignored `.env.local` from the legacy `.env` **only if `.env.local` does not already exist**. It maps the existing Atlas, Cloudinary, and MapTiler variable names and generates a fresh session secret. It never prints credentials or changes the database. Alternatively, copy `.env.example` to `.env.local` and fill it in manually.

| Variable                   | Purpose                                                                 |
| -------------------------- | ----------------------------------------------------------------------- |
| `MONGODB_URI`              | Atlas URI including the existing application's database name            |
| `NEXTAUTH_URL`             | Canonical origin, e.g. `http://localhost:3000` locally                  |
| `NEXTAUTH_SECRET`          | Random secret of at least 32 characters                                 |
| `CLOUDINARY_CLOUD_NAME`    | Cloudinary account name                                                 |
| `CLOUDINARY_API_KEY`       | Server-side signing API key; returned only as needed for signed uploads |
| `CLOUDINARY_API_SECRET`    | Server-only Cloudinary signing secret                                   |
| `MAPTILER_API_KEY`         | Server-side geocoding key                                               |
| `NEXT_PUBLIC_MAPTILER_KEY` | Browser map key; use domain restrictions and configure before building  |

Never prefix database, authentication, or Cloudinary secrets with `NEXT_PUBLIC_`. Server environment variables are validated with Zod at request time, allowing builds without database access. The browser map key has a separate typed environment module. Maps show a clean fallback when the browser key, WebGL, or provider is unavailable.

## Application structure

```text
src/
  app/                  Server-rendered pages, loading/error boundaries, API routes
  components/
    forms/              React Hook Form + Zod account and listing forms
    layout/             Responsive navigation and footer
    listings/           Search, filters, galleries, owner actions, NPR prices
    maps/               Browser-only MapTiler SDK lifecycle
    reviews/            TanStack Query optimistic reviews and rating summaries
    theme/              Accessible Radix Light / Dark / System preference menu
    ui/                 shadcn-style Radix primitives and shared buttons
  providers/            Theme, NextAuth, TanStack Query, and shared VAT state
  lib/
    actions/            Authenticated Server Actions using the shared services
    auth/               NextAuth credentials/JWT sessions, passwords, DB rate limits
    services/           Listing/review rules, Cloudinary verification, geocoding
    utils/pricing.ts    NPR formatting and 13% VAT calculations in paisa
    validation/         Shared Zod request and form schemas
    env.ts              Server-only validated secrets
    env.client.ts       Browser-visible configuration
    db.ts               Cached, bounded serverless MongoDB connection pool
  models/               Strict TypeScript Mongoose models
  types/                Database interfaces, serialized DTOs, session augmentation
scripts/                Local configuration, explicit index setup, isolated QA tools
tests/                  Unit and disposable replica-set integration tests
```

The original `app.js`, `controllers`, `models`, `routes`, `views`, `utils`, `init`, `schema.js`, and `cloudconfig.js` remain as migration references. Express middleware is retained as `legacy-middleware.js` so Next.js does not discover it as framework middleware. They are **inactive**: the npm scripts start Next.js, and TypeScript checks the new `src` tree. Express, EJS, Passport, Joi, and their session middleware are no longer application dependencies. Retained branding assets in `public/images` remain available.

## Themes and shared client state

Brand assets live in `public/branding`. `src/lib/branding.ts` records their paths and the supplied social image dimensions. The navbar and footer use `BrandLogo`, which selects the light/dark PNG through the root theme class before hydration. Its fixed layout clips the transparent vertical margins of the original horizontal logo files without modifying the artwork.

Root metadata references the supplied PNG favicon, 180px Apple touch icon, and Open Graph/Twitter social preview. The typed `/manifest.webmanifest` uses the 192px and 512px app icons; the old `/manifest.json` URL redirects there. These manifest entries do not add offline functionality. Social image URLs use the canonical `NEXTAUTH_URL` origin (or the Vercel production domain when unset), so configure the public HTTPS origin when deploying. Replacing a branding file at the same path may require a hard refresh or clearing a browser's favicon cache.

The single floating theme menu offers Light, Dark, and System on desktop and mobile. It stays visible at the lower-left of the viewport while scrolling, clear of the bottom-right toast area. System is the default and follows operating-system changes. `next-themes` applies the saved preference before the page paints, using the `dark`/`light` class on the root element. Only that element suppresses its expected hydration difference; theme-dependent menu state waits until mounting. The theme provider also disables transitions during preference changes and sets the browser color scheme for native controls.

Semantic CSS variables cover surfaces, text, buttons, borders, focus indicators, forms, dialogs, photo controls, and skeletons. Toasts follow the active preference. MapTiler switches between its light and dark Streets styles without recreating the map or resetting the viewport. The minimal global error document follows the operating-system color scheme if the main provider cannot mount.

Theme selection uses `aawasly:theme` in local storage; VAT uses the independent `aawasly:include-tax` key. VAT changes update all cards and detail prices and synchronize across tabs. Theme preferences are presentation state and do not alter listing, review, or user documents. If storage is unavailable, both controls still work for the current session.

The implementation follows the [shadcn/ui Next.js theme setup](https://ui.shadcn.com/docs/dark-mode/next) and [next-themes hydration guidance](https://github.com/pacocoursey/next-themes#avoid-hydration-mismatch).

## Data and account compatibility

- Existing `listings`, `reviews`, and `users` collection names and ObjectIds are unchanged.
- Existing listing fields, review references, ownership, GeoJSON coordinates, and ten category values are preserved.
- `image` remains the cover photo. Optional `images` and `amenities` support galleries and filtering. Older listings fall back to their original `image` and an empty amenities list.
- `price` remains a pre-tax NPR number. VAT is calculated on demand, rounded to paisa, and controlled by a shared persisted browser preference on both cards and detail pages.
- Existing Passport username/password hashes are verified using the original package's PBKDF2 settings. Successful login replaces them with an independently salted scrypt hash. Users do not need password resets. Existing Express sessions do not carry across; users log in again.
- New users need a password of at least 12 characters. Legacy users retain their existing password until they choose to change it in a future account-management feature.
- Owner privileges are determined **per listing**. A host can edit/delete their own listing; a regular user can review listings and delete their own reviews. No client-provided role or owner ID grants access.
- Listings and their reviews are deleted in one transaction. Review creation/deletion atomically maintains listing references; deletion verifies both authorship and membership of the review in that listing.
- New bookings can reference `Listing` and `User` ObjectIds in a separate collection without changing the current schemas. Bookings, availability calendars, payments, password recovery, and email delivery are not implemented in this phase.

Before deployment, back up the database and verify that every listing has a valid category and valid GeoJSON coordinates. The original `init/index.js` is destructive and is not used by this migration.

## API

| Method         | Endpoint                              | Access                                          |
| -------------- | ------------------------------------- | ----------------------------------------------- |
| GET            | `/api/listings`                       | Public, validated search/filter/sort/pagination |
| POST           | `/api/listings`                       | Authenticated                                   |
| GET            | `/api/listings/:id`                   | Public                                          |
| PATCH / DELETE | `/api/listings/:id`                   | Listing owner                                   |
| GET            | `/api/listings/:id/reviews`           | Public                                          |
| POST           | `/api/listings/:id/reviews`           | Authenticated                                   |
| DELETE         | `/api/listings/:id/reviews/:reviewId` | Review author; review must belong to listing    |
| POST           | `/api/uploads/signature`              | Authenticated; bounded signing rate             |
| POST           | `/api/auth/signup`                    | Public, rate limited, same-origin JSON          |
| GET / POST     | `/api/auth/*`                         | NextAuth session, CSRF, credentials, sign-out   |

Search parameters: `q`, `category`, `minPrice`, `maxPrice`, `minRating`, `amenities` (comma separated), `sort` (`newest`, `price-asc`, `price-desc`, `rating`), and `page`. Prices filter against the pre-tax NPR nightly rate. Results contain at most 12 listings. Regex metacharacters in searches are escaped.

Mutation handlers validate inputs, reject foreign origins, and derive identities from HTTP-only JWT session cookies. NextAuth handles its own CSRF protection; custom JSON mutation routes enforce the configured canonical origin. Rate limits use MongoDB counters shared across serverless instances, with a TTL index for cleanup. On Vercel, IP limiting uses Vercel's overwritten IP header; local development shares one IP bucket.

The React listing forms, owner deletion dialog, and optimistic review mutations use Server Actions in `src/lib/actions/listings.ts`. Each action independently authenticates the caller, validates untrusted arguments with Zod, applies mutation rate limits, and delegates ownership and transaction rules to the existing services. Successful mutations revalidate browse and detail pages. Errors return a typed, serializable result without exposing provider details. Next.js provides the Server Action origin checks; the JSON API remains available and uses the same services. Cloudinary signing and NextAuth continue to use their API handlers.

Photos upload directly to Cloudinary using server-generated signatures and unique user-scoped public IDs. The browser checks formats and the 8 MB limit; the server verifies the uploaded resource, folder ownership, format, and size before attaching it to a listing. Existing photos remain valid during edits. File bytes do not pass through Vercel functions. Unattached or superseded Cloudinary resources are retained; configure an asset-retention process for storage housekeeping.

## Checks and isolated QA

```sh
npm run typecheck
npm test
npm run test:integration
npm run build
```

The integration suite starts a disposable single-node MongoDB replica set. It **never reads `.env.local` or uses Atlas**. Its first run may download a MongoDB binary into ignored `.cache/mongodb-binaries`.

For a production-server smoke test and local review using six legacy sample listings:

```sh
# Terminal 1, after npm run build:
node scripts/preview-fixture.mjs
# Terminal 2:
node scripts/http-smoke.mjs
```

The fixture starts at http://localhost:3100/listing and is deleted when its process exits. Disposable accounts are `preview_host` and `preview_guest`, both with `preview-only-password`. The host uses a legacy Passport hash so smoke tests exercise the real migration path. These accounts do not exist in Atlas. The smoke script is exclusively for this fixture and edits its temporary data. Stop the fixture process when finished.

Unit tests cover pricing, shared validation, provider failures, old/new password verification, and Server Action safeguards. DOM tests cover theme selection/persistence, system preference changes, and synchronized VAT displays. Replica-set integration tests cover ownership, review membership, atomic relationships, cascading deletion, filters, rate limiting, origin checks, and request-size limits. The HTTP smoke test exercises production rendering, protected pages, legacy login, cookies, listing edits, and review mutations. DOM tests verify behavior; they do not replace visual browser checks or a first-paint screenshot test.

## Deploy to Vercel

1. Import this repository as a Next.js project with the repository root as its root directory. Use Node.js 22 or 24 and the committed npm lockfile.
2. Set all environment variables from `.env.example` in the appropriate Vercel environments. Use a separate Atlas database for Preview. Set `NEXTAUTH_URL` to that deployment's canonical HTTPS origin, and use a strong secret per environment. Configure preview URLs consistently with the origin checks.
3. Set the browser MapTiler key **before building**, restrict it to approved domains, and enable the intended server geocoding key and Cloudinary account.
4. Configure Atlas network access for your Vercel networking arrangement. Database code uses the Node.js runtime, not the Edge runtime.
5. Before production traffic, run `npm run db:indexes` from a trusted environment pointed at the intended database. This explicit maintenance command adds the username uniqueness, listing filter/owner/geospatial, and rate-limit TTL indexes. It does not drop indexes or alter documents. Index creation intentionally does not run during builds or startup; resolve any pre-existing invalid coordinates or duplicate usernames before this step.
6. Deploy using `npm run build` (the default project build command). Exercise login, uploads, location lookup, review changes, and deletion against the preview database before promoting.

No production deployment or Atlas data migration is performed by the local setup/build/test commands. Production Cloudinary uploads and MapTiler geocoding require live provider verification in your preview deployment.

Implementation references: [Next.js installation and App Router](https://nextjs.org/docs/app/getting-started/installation), [NextAuth credentials](https://next-auth.js.org/configuration/providers/credentials), [Mongoose with Next.js](https://mongoosejs.com/docs/nextjs.html).
