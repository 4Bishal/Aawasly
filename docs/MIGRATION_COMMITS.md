# Aawasly migration commit history

This migration is organized into ten Conventional Commits, in dependency order. The commands below describe the original uncommitted migration; do not rerun them after these commits already exist.

The application uses Next.js 16 and Tailwind CSS 4. Tailwind is configured through `postcss.config.mjs` and `src/app/globals.css`; the environment template is `.env.example`. No unused `tailwind.config.ts` or duplicate environment template is needed.

Shared listing services and actions contain both listing and review foundations and are introduced in step 6. Step 8 connects review API handlers and optimistic UI to those foundations. Search validation and database querying are shared foundations introduced before the search controls in step 9. These are layer-oriented migration checkpoints: intermediate commits may reference later UI modules and are not independent release points. Deploy the complete sequence; revert dependent layers before reverting their foundations.

Wishlist hearts, price pins, and a map split view are not implemented and are not claimed by these commits. Legacy source is retained as a reference, with the reserved middleware filename corrected. Secrets, dependency directories, generated builds, and local caches are excluded.

## Validation

Run `npm run typecheck`, `npm test`, `npm run test:integration`, and `npm run build` on the completed sequence. Provider calls and visual browser checks require their separate live environment. Integration tests use a disposable replica set, not Atlas.

## Exact Bash commands

Start from the original migration working tree with an empty index and the intended author configured. Verify the remote before pushing. If the migration branch already exists, inspect it instead of recreating it.

```bash
git status --short
git remote -v
git fetch origin
git switch -c refactor/aawasly-nextjs-migration
```

### 1. chore: initialize Next.js App Router with TypeScript and Tailwind CSS

```bash
git --literal-pathspecs add -- \
  '.gitignore' \
  '.env.example' \
  '.prettierignore' \
  'package.json' \
  'package-lock.json' \
  'tsconfig.json' \
  'next-env.d.ts' \
  'next.config.ts' \
  'postcss.config.mjs' \
  'components.json' \
  'vitest.config.ts' \
  'vitest.integration.config.ts' \
  'tests/server-only.ts' \
  'scripts/setup-env.mjs' \
  'middleware.js' \
  'legacy-middleware.js' \
  'routes/listing.js' \
  'routes/review.js' \
  'routes/user.js'
git commit --file - <<'COMMIT'
chore: initialize Next.js App Router with TypeScript and Tailwind CSS

- Configure Next.js 16, strict TypeScript, Tailwind 4, and package scripts
- Add environment templates, formatting, and test tooling
- Rename archived Express middleware to avoid Next.js auto-discovery
COMMIT
```

### 2. feat(core): add theme providers, NPR pricing utilities, and global styles

```bash
git --literal-pathspecs add -- \
  'src/app/globals.css' \
  'src/providers/app-providers.tsx' \
  'src/providers/theme-provider.tsx' \
  'src/providers/pricing-provider.tsx' \
  'src/lib/utils.ts' \
  'src/lib/utils/pricing.ts' \
  'src/lib/constants.ts' \
  'src/lib/env.ts' \
  'src/lib/env.client.ts' \
  'tests/pricing.test.ts'
git commit --file - <<'COMMIT'
feat(core): add theme providers, NPR pricing utilities, and global styles

- Compose theme, session, query, and persisted VAT providers
- Format NPR prices and calculate 13 percent VAT in paisa
- Add typed environment access and shared design tokens
COMMIT
```

### 3. feat(db): add typed Mongoose models and shared Zod validation

```bash
git --literal-pathspecs add -- \
  'src/lib/db.ts' \
  'src/models/Listing.ts' \
  'src/models/Review.ts' \
  'src/models/User.ts' \
  'src/models/RateLimit.ts' \
  'src/types/index.ts' \
  'src/lib/validation/index.ts' \
  'scripts/ensure-indexes.mjs' \
  'tests/validation.test.ts'
git commit --file - <<'COMMIT'
feat(db): add typed Mongoose models and shared Zod validation

- Preserve existing MongoDB collections, references, and legacy user fields
- Cache serverless connections and define listing, review, user, and rate-limit models
- Add shared input validation and explicit index maintenance
COMMIT
```

### 4. feat(auth): integrate NextAuth sessions and secure credential authentication

```bash
git --literal-pathspecs add -- \
  'src/lib/auth/index.ts' \
  'src/lib/auth/password.ts' \
  'src/lib/auth/rate-limit.ts' \
  'src/lib/http.ts' \
  'src/lib/client-api.ts' \
  'src/types/next-auth.d.ts' \
  'src/app/api/auth/[...nextauth]/route.ts' \
  'src/app/api/auth/signup/route.ts' \
  'src/app/login/page.tsx' \
  'src/app/signup/page.tsx' \
  'src/components/forms/auth-forms.tsx' \
  'tests/password.test.ts'
git commit --file - <<'COMMIT'
feat(auth): integrate NextAuth sessions and secure credential authentication

- Add credentials login, signup, HTTP-only JWT sessions, and authorization helpers
- Verify legacy Passport passwords and upgrade successful logins to scrypt
- Validate mutation origins, sanitize errors, and rate-limit authentication
COMMIT
```

### 5. feat(ui): add branded navigation, shared layouts, and floating theme controls

```bash
git --literal-pathspecs add -- \
  'src/app/layout.tsx' \
  'src/app/page.tsx' \
  'src/app/loading.tsx' \
  'src/app/error.tsx' \
  'src/app/global-error.tsx' \
  'src/app/not-found.tsx' \
  'src/app/manifest.ts' \
  'src/lib/branding.ts' \
  'src/components/brand/brand-logo.tsx' \
  'src/components/layout/navbar.tsx' \
  'src/components/layout/footer.tsx' \
  'src/components/theme/theme-switcher.tsx' \
  'src/components/ui/button.tsx' \
  'src/components/ui/dialog.tsx' \
  'src/components/ui/dropdown-menu.tsx' \
  'src/components/listings/price.tsx' \
  'tests/theme-pricing.test.tsx' \
  'public/branding/app-icon-master.png' \
  'public/branding/apple-touch-icon.png' \
  'public/branding/icon-192.png' \
  'public/branding/icon-512.png' \
  'public/branding/logo-dark.png' \
  'public/branding/logo-light.png' \
  'public/branding/social-preview.png' \
  'public/branding/symbol-dark.png' \
  'public/branding/symbol-light.png' \
  'public/manifest.json'
git commit --file - <<'COMMIT'
feat(ui): add branded navigation, shared layouts, and floating theme controls

- Build responsive navigation, doorway-pattern footer, and one floating theme selector
- Add shared Radix primitives, VAT controls, loading states, and error pages
- Integrate supplied logos, app icons, manifest, and social metadata
COMMIT
```

### 6. feat(listings): add property CRUD, signed uploads, galleries, and listing views

```bash
git --literal-pathspecs add -- \
  'src/lib/services/listings.ts' \
  'src/lib/services/cloudinary.ts' \
  'src/lib/action-result.ts' \
  'src/lib/actions/execute.ts' \
  'src/lib/actions/listings.ts' \
  'src/app/api/listings/route.ts' \
  'src/app/api/listings/[id]/route.ts' \
  'src/app/api/uploads/signature/route.ts' \
  'src/components/forms/listing-form.tsx' \
  'src/components/listings/gallery.tsx' \
  'src/components/listings/listing-card.tsx' \
  'src/components/listings/owner-actions.tsx' \
  'src/app/listing/page.tsx' \
  'src/app/listing/new/page.tsx' \
  'src/app/listing/[id]/page.tsx' \
  'src/app/listing/[id]/edit/page.tsx' \
  'src/app/listing/[id]/loading.tsx' \
  'tests/actions.test.ts'
git commit --file - <<'COMMIT'
feat(listings): add property CRUD, signed uploads, galleries, and listing views

- Implement owner-checked listing mutations and shared transactional service foundations
- Add authenticated Server Actions and reusable serialized mutation results
- Build listing forms, grid, detail pages, image galleries, and Cloudinary upload verification
COMMIT
```

### 7. feat(map): add theme-aware MapTiler property maps and geocoding

```bash
git --literal-pathspecs add -- \
  'src/components/maps/property-map.tsx' \
  'src/lib/services/geocoding.ts' \
  'tests/providers.test.ts'
git commit --file - <<'COMMIT'
feat(map): add theme-aware MapTiler property maps and geocoding

- Embed browser-only light and dark maps with property markers
- Validate geocoding responses and handle unavailable map providers
- Verify upload and geocoding provider failure paths
COMMIT
```

### 8. feat(reviews): add optimistic reviews, rating stars, and authored deletion

```bash
git --literal-pathspecs add -- \
  'src/components/reviews/review-section.tsx' \
  'src/app/api/listings/[id]/reviews/route.ts' \
  'src/app/api/listings/[id]/reviews/[reviewId]/route.ts' \
  'tests/listings.integration.test.ts'
git commit --file - <<'COMMIT'
feat(reviews): add optimistic reviews, rating stars, and authored deletion

- Connect review creation and deletion to shared authenticated actions and services
- Update reviews and rating summaries optimistically with rollback on failure
- Verify ownership, review membership, transactions, and cascade deletion
COMMIT
```

### 9. feat(search): add debounced destination search and advanced listing filters

```bash
git --literal-pathspecs add -- \
  'src/components/listings/filters.tsx' \
  'src/app/listing/filter/page.tsx'
git commit --file - <<'COMMIT'
feat(search): add debounced destination search and advanced listing filters

- Add seamless destination search with clear and loading controls
- Filter by category, pre-tax price, rating, and amenities with URL persistence
- Support sorting and preserve the legacy category-filter URL
COMMIT
```

### 10. docs: document the Next.js migration and Vercel deployment workflow

```bash
git --literal-pathspecs add -- \
  'README.md' \
  'scripts/preview-fixture.mjs' \
  'scripts/http-smoke.mjs' \
  'docs/MIGRATION_COMMITS.md'
git commit --file - <<'COMMIT'
docs: document the Next.js migration and Vercel deployment workflow

- Document environment setup, account compatibility, branding, and deployment
- Add disposable preview fixtures and production HTTP smoke checks
- Record the exact ten-step commit commands and validation limitations
COMMIT
```

After the ten commits and successful checks:

```bash
git status --short
git log --oneline -10
git diff --check HEAD~10 HEAD
git push -u origin refactor/aawasly-nextjs-migration
```

The pushed branch is intended for GitHub review before merging into `main`. No force push or existing-history rewrite is required.
