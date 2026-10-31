# Sharma Electronics — Admin setup

## Framework note
The brief asked for Next.js; this project runs on TanStack Start (Lovable's supported framework). Equivalents: route `loader`/`head()` instead of Next metadata, `createServerFn` instead of server actions, React Query invalidation instead of `revalidatePath`.

## Backend
Database, auth and storage are provided by Lovable Cloud (already connected). Migrations are in `drizzle/migrations/` and applied automatically.

## First administrator
1. Open **Cloud → Users → Add user**, create the owner's account (email + password).
2. Ask Lovable to "make <email> an admin" (inserts a row into `user_roles`).
3. Sign in at `/admin/login`.
Recommended: turn off public sign-ups in **Cloud → Users → Auth settings** — the site has no sign-up form, and non-admin accounts cannot change anything anyway.

## Security model
- RLS: anyone can read *published* products; only admins (via `is_admin()`) can insert/update/delete.
- Storage bucket `product-images` (private, 5 MB limit): only admins can upload/replace/delete; images are shown via signed links.
- Every admin server function re-checks admin status.
- Stock is changed via the `adjust_stock()` database function (atomic, never below zero).

## Images
JPEG/PNG/WebP up to 5 MB, renamed to random file names. Replaced/removed images are deleted only if no other product uses them.

## Before launch
Replace the 27 sample products (made-up prices and stock), set `websiteUrl` in `src/config/store.ts`, and add address/hours.

## Troubleshooting
- "This account doesn't have admin access" → the user has no admin role row.
- Upload fails with "row-level security" → signed in as non-admin.
- Product missing from store → it's a draft (unpublished).
